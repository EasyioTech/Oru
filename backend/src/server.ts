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
import authPlugin from './plugins/auth.js';
import caslPlugin from './plugins/casl.js';
import swaggerPlugin from './plugins/swagger.js';

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
        if (!origin || allowedOrigins.indexOf(origin) !== -1 || origin.includes('localhost')) {
            cb(null, true);
        } else {
            cb(new Error("Not allowed by CORS"), false);
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
});

await server.register(helmet, {
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
});

await server.register(rateLimit, { max: 1000, timeWindow: '1 minute' });
await server.register(multipart, { limits: { fileSize: 10 * 1024 * 1024 } });

// --- 3. Core Logic Plugins ---
await server.register(dbPlugin);
await server.register(authPlugin);
await server.register(caslPlugin);
await server.register(swaggerPlugin);

// --- 4. Define Root Routes BEFORE Static to avoid interception ---

// Health
server.get('/health', async () => ({ status: 'ok', uptime: process.uptime() }));

// SEO at root
server.get('/sitemap.xml', async (request, reply) => {
    try {
        const { CatalogService } = await import('./modules/catalog/service.js');
        const { BlogService } = await import('./modules/blog/service.js');
        const catalogService = new CatalogService(server.log);
        const blogService = new BlogService(server.log);
        
        const [publicPages, blogPosts] = await Promise.all([
            catalogService.listPublicPages(),
            blogService.listPublicPosts('', 1000)
        ]);

        const baseUrl = 'https://oruerp.com';
        const staticPages = ['', '/pricing', '/about', '/blog', '/contact', '/privacy', '/terms'];
        const catalogUrls = publicPages.map(p => `/features/${p.path.replace(/^\//, '').replace(/\//g, '-')}`);
        const blogUrls = blogPosts.map(p => `/blog/${p.slug}`);
        const allPages = [...new Set([...staticPages, ...catalogUrls, ...blogUrls])];

        const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${allPages.map(page => `  <url>\n    <loc>${baseUrl}${page}</loc>\n    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>${page === '' ? '1.0' : '0.8'}</priority>\n  </url>`).join('\n')}\n</urlset>`;
        return reply.type('application/xml').send(xml);
    } catch (e: any) {
        server.log.error(e);
        return reply.status(500).send('Error generating sitemap: ' + e.message);
    }
});

server.get('/robots.txt', async (request, reply) => {
    return reply.type('text/plain').send('User-agent: *\nAllow: /\nSitemap: https://oruerp.com/sitemap.xml\n');
});

// --- 5. Register Static and Autoload ---

// Register static for uploads
await server.register(fastifyStatic, {
    root: path.join(process.cwd(), 'uploads'),
    prefix: '/uploads/',
    decorateReply: false
});

// Register static for frontend dist
await server.register(fastifyStatic, {
    root: frontendDist,
    prefix: '/',
    wildcard: true,
    decorateReply: true, // Only this one decorates reply.sendFile
});

// Autoload modules (prefix /api)
await server.register(autoLoad, {
    dir: path.join(__dirname, 'modules'),
    options: { prefix: '/api' },
    indexPattern: /^routes\.[jt]s$/,
    ignorePattern: /schemas\.ts$|service\.ts$|abilities\.ts$/,
});

// SPA Fallback and NotFound
if (process.env.NODE_ENV === 'production') {
    server.log.info(`Serve frontend from: ${frontendDist}`);
    server.setNotFoundHandler(async (request, reply) => {
        // API 404
        if (request.url.startsWith('/api')) {
            return reply.status(404).send({ error: true, message: 'Route not found', code: 'NOT_FOUND' });
        }
        // Frontend SPA Fallback
        return reply.sendFile('index.html');
    });
}

// Global Error Handler
server.setErrorHandler((error: any, request, reply) => {
    if (error.name === 'ZodError') {
        return reply.status(400).send({ error: true, message: 'Validation Error', details: error.issues, code: 'VALIDATION_ERROR' });
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
        await server.listen({ port, host: '0.0.0.0' });
        const { initWorkers } = await import('./jobs/worker.js');
        (global as any).workers = initWorkers(server.log);
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
