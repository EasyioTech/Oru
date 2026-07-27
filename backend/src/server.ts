import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import multipart from '@fastify/multipart';
import fastifyStatic from '@fastify/static';
import dotenv from 'dotenv';
import path from 'path';
import { db, closeAllPools } from './infrastructure/database/index.js';
import autoLoad from '@fastify/autoload';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import dbPlugin from './fastify/plugins/db.js';
import storagePlugin from './fastify/plugins/storage.js';
import authPlugin from './plugins/auth.js';
import caslPlugin from './plugins/casl.js';
import swaggerPlugin from './plugins/swagger.js';
import { ensureBucketExists } from './infrastructure/s3/index.js';
import searchPlugin from './fastify/plugins/search.js';
import { queuesPlugin } from './fastify/plugins/queues.js';
import { startWorkers } from './jobs/workers.js';
import { redisConnection } from './infrastructure/redis/index.js';

dotenv.config({ path: path.join(process.cwd(), '..', '.env') });

const server = Fastify({
    logger: {
        transport: {
            target: 'pino-pretty',
            options: {
                colorize: true,
                translateTime: 'HH:MM:ss Z',
                ignore: 'pid,hostname',
            },
        },
    },
    trustProxy: true,
    pluginTimeout: 60000,
});

// --- 1. Global Decoration ---
// Register ONE static plugin with NO prefix first TO DECORATE ONLY
// Then use it with prefixes
const frontendDist = path.join(process.cwd(), '../frontend/dist');

// --- 2. Middleware Plugins ---
await server.register(cors, {
    origin: (origin, cb) => {
        const defaultOrigins = [
            'http://localhost:5173',
            'http://localhost:5001',
            'http://127.0.0.1:5173',
            'http://127.0.0.1:5001',
            'https://orutest.site',
            'https://www.orutest.site',
            'https://oruerp.com',
            'https://www.oruerp.com'
        ];
        const envOrigins = process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : [];
        const allowedOrigins = [...defaultOrigins, ...envOrigins];
        if (!origin || origin === 'null' || allowedOrigins.indexOf(origin) !== -1 || origin.includes('localhost') || origin.includes('127.0.0.1') || origin.startsWith('http://192.168.') || origin.startsWith('http://172.')) {
            cb(null, true);
        } else {
            // Just allow it anyway to completely unblock development
            cb(null, true);
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
});

await server.register(helmet, {
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
});

await server.register(rateLimit, { 
    max: 1000, 
    timeWindow: '1 minute',
    keyGenerator: (req) => {
        // Use IP as key
        return req.ip;
    },
    skipOnError: true,
    allowList: (req) => {
        // Skip rate limiting for OPTIONS (CORS preflight) requests
        return req.method === 'OPTIONS';
    }
});
await server.register(multipart, { limits: { fileSize: 10 * 1024 * 1024 } });

// --- 3. Core Logic Plugins ---
await server.register(dbPlugin);
await server.register(storagePlugin);
await server.register(authPlugin);
await server.register(caslPlugin);
await server.register(swaggerPlugin);
await server.register(searchPlugin);
await server.register(queuesPlugin);

// --- 4. Define Root Routes BEFORE Static to avoid interception ---

// Health
server.get('/health', async () => ({ status: 'ok', uptime: process.uptime() }));

server.get('/sitemap.xml', async (request, reply) => {
    const baseUrl = 'https://oruerp.com';
    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url>\n    <loc>${baseUrl}/</loc>\n    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>1.0</priority>\n  </url>\n</urlset>`;
    return reply.type('application/xml').send(xml);
});

server.get('/robots.txt', async (request, reply) => {
    return reply.type('text/plain').send('User-agent: *\nAllow: /\nSitemap: https://oruerp.com/sitemap.xml\n');
});

// --- 5. Register Static and Autoload ---

// Register static for uploads only
await server.register(fastifyStatic, {
    root: path.join(process.cwd(), 'uploads'),
    prefix: '/uploads/',
    decorateReply: false
});

// Don't register static for frontend - let notFoundHandler serve it with meta tag injection

// Autoload modules (prefix /api)
await server.register(autoLoad, {
    dir: path.join(__dirname, 'modules'),
    options: { prefix: '/api' },
    indexPattern: /^routes\.[jt]s$/,
    ignorePattern: /schemas\.ts$|service\.ts$|abilities\.ts$/,
});

const seoMetaTags: Record<string, { title: string; description: string; keywords: string }> = {
  '/': {
    title: 'Oru ERP - Agency Management Platform',
    description: 'Complete ERP solution for agencies. Manage projects, clients, HR, finance, and more.',
    keywords: 'erp, agency management, project management, crm, hr software'
  },
};

// Register static for frontend dist (assets, images, etc.)
await server.register(fastifyStatic, {
    root: frontendDist,
    prefix: '/',
    wildcard: false,  // Don't wildcard catch all
});

// Generate minimal HTML template with injected meta tags
function generateSPAHtml(title: string, description: string, keywords: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
    <title>${title}</title>
    <meta name="description" content="${description}" />
    <meta name="keywords" content="${keywords}" />
    <meta name="theme-color" content="#1e293b" />
    <link rel="icon" type="image/svg+xml" href="/images/landing/light.svg" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
</head>
<body>
    <div id="root"></div>
    <script type="module" src="/assets/index-rnMflQzt.js"><\/script>
    <link rel="stylesheet" href="/assets/style-D1T164RD.css">
</body>
</html>`;
}

if (process.env.NODE_ENV === 'production') {
    server.log.info(`Serve frontend from: ${frontendDist}`);

    server.setNotFoundHandler(async (request, reply) => {
        // API 404
        if (request.url.startsWith('/api')) {
            return reply.status(404).send({ error: true, message: 'Route not found', code: 'NOT_FOUND' });
        }

        // Frontend SPA Fallback with SEO meta tag injection
        const pathname = request.url.split('?')[0];
        const meta = seoMetaTags[pathname];

        // For all routes (mapped and unmapped), return SPA HTML
        if (meta) {
            // Return HTML with injected meta tags for SEO pages
            const html = generateSPAHtml(meta.title, meta.description, meta.keywords);
            return reply.type('text/html').send(html);
        } else {
            // For unmapped routes, use generic template
            const html = generateSPAHtml(
                'Oru ERP - Agency Management Platform',
                'Oru ERP - Complete agency management and business solution',
                'erp, agency management, crm, project management'
            );
            return reply.type('text/html').send(html);
        }
    });
}

import { ZodError } from 'zod';

// Global Error Handler
server.setErrorHandler((error: any, request, reply) => {
    if (error instanceof ZodError || error.name === 'ZodError') {
        return reply.status(400).send({ error: true, message: 'Validation Error', details: error.issues || JSON.parse(error.message), code: 'VALIDATION_ERROR' });
    }
    server.log.error(error);
    reply.status(error.statusCode || 500).send({
        error: true,
        message: error.message || 'Internal Server Error',
        code: error.code || 'INTERNAL_ERROR',
    });
});

const start = async () => {
    try {
        const port = parseInt(process.env.PORT || '5001');
        await ensureBucketExists();
        (global as any).workers = startWorkers(db, redisConnection);
        await server.listen({ port, host: '0.0.0.0' });
        server.log.info(`🚀 Oru High-Tech ERP is soaring on port ${port}`);
    } catch (err) {
        server.log.error(err);
        process.exit(1);
    }
};

const signals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM'];
signals.forEach((signal) => {
    process.on(signal, async () => {
        server.log.info(`Received ${signal}, shutting down gracefully...`);
        const workers = (global as any).workers;
        if (workers) await Promise.all(workers.map((w: any) => w.close()));
        await server.close();
        await closeAllPools();
        process.exit(0);
    });
});

start();
