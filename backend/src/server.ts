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

// Meta tags for different page types
const seoMetaTags: Record<string, { title: string; description: string; keywords: string }> = {
  // Industries
  '/industries/marketing-agencies': {
    title: 'Best ERP for Marketing & Advertising Agencies | Oru ERP',
    description: 'Ranked #1 ERP for marketing agencies. Manage campaigns, creative resources, and agency profitability with Oru ERP.',
    keywords: 'marketing agency erp, ad agency software, creative agency management, agency profitability tool'
  },
  '/industries/software-development': {
    title: 'ERP for Software Development Teams | Oru ERP',
    description: 'Purpose-built ERP for software agencies. Project tracking, resource allocation, and client billing.',
    keywords: 'software development erp, dev team management, technical project management, billing software'
  },
  '/industries/creative-agencies': {
    title: 'Creative Agency Management Software | Oru ERP',
    description: 'ERP designed for creative agencies. Design projects, creative workflows, and team collaboration.',
    keywords: 'creative agency erp, design project management, creative team software, design billing'
  },
  '/industries/consulting-firms': {
    title: 'Consulting Firm ERP & Project Management | Oru ERP',
    description: 'ERP for consulting firms. Billable hours, project profitability, and client engagement tracking.',
    keywords: 'consulting erp, billable hours tracking, professional services automation, consulting software'
  },
  '/industries/digital-marketing': {
    title: 'Digital Marketing Agency Software | Oru ERP',
    description: 'ERP for digital marketing agencies. Campaign management, client tracking, and ROI reporting.',
    keywords: 'digital marketing erp, marketing agency software, campaign management, marketing automation'
  },
  '/industries/advertising': {
    title: 'Advertising Agency Management Platform | Oru ERP',
    description: 'Complete ERP for advertising agencies. Creative workflows, media buys, and client collaboration.',
    keywords: 'advertising agency software, ad agency erp, media buying platform, advertising management'
  },
  '/industries/media-production': {
    title: 'Media Production Company ERP | Oru ERP',
    description: 'ERP for media production. Project tracking, resource scheduling, and production workflows.',
    keywords: 'media production software, video production erp, production management, broadcast management'
  },
  '/industries/architecture-design': {
    title: 'Architecture & Design Firm Software | Oru ERP',
    description: 'ERP for architecture and design firms. Project management, blueprints, and client communication.',
    keywords: 'architecture firm software, design firm erp, architectural project management, cad management'
  },
  '/industries/legal-services': {
    title: 'Legal Practice Management Software | Oru ERP',
    description: 'ERP for law firms. Time tracking, case management, and billable hours automation.',
    keywords: 'legal practice management, law firm software, time tracking, case management, legal billing'
  },
  '/industries/accounting-firms': {
    title: 'Accounting Firm Software & ERP | Oru ERP',
    description: 'ERP for accounting firms. Client management, engagement tracking, and financial reporting.',
    keywords: 'accounting firm software, cpa firm management, accounting erp, tax firm software'
  },
  '/industries/it-services': {
    title: 'IT Services & MSP Management Software | Oru ERP',
    description: 'ERP for IT service providers. Ticket tracking, billing, and resource management.',
    keywords: 'msp software, it services erp, managed services platform, it billing'
  },
  '/industries/freelancers': {
    title: 'Freelancer Business Management Software | Oru ERP',
    description: 'Simplified ERP for freelancers. Invoicing, time tracking, and client management.',
    keywords: 'freelancer software, freelance invoicing, time tracking, freelance management'
  },
  // Comparisons
  '/compare/odoo': {
    title: 'Oru ERP vs Odoo: Complete Feature Comparison | 2026',
    description: 'Compare Oru ERP vs Odoo. See why agencies choose Oru for better features, pricing, and support.',
    keywords: 'oru vs odoo, erp comparison, odoo alternative, best erp for agencies'
  },
  '/compare/sap-business-one': {
    title: 'Oru ERP vs SAP Business One: Detailed Comparison',
    description: 'Oru ERP vs SAP Business One comparison. Better pricing, faster setup, agency-focused features.',
    keywords: 'oru vs sap business one, erp comparison, sap alternative, enterprise software'
  },
  '/compare/monday': {
    title: 'Oru ERP vs Monday.com: Feature & Price Comparison',
    description: 'Compare Oru ERP with Monday.com. Full ERP vs project management tool - which is right for you?',
    keywords: 'oru vs monday, monday alternative, project management software, erp comparison'
  },
  '/compare/zoho': {
    title: 'Oru ERP vs Zoho One: Complete Comparison Guide',
    description: 'Oru ERP vs Zoho One comparison. See why agencies prefer Oru for integrated management.',
    keywords: 'oru vs zoho, zoho alternative, erp comparison, business suite'
  },
  '/compare/netsuite': {
    title: 'Oru ERP vs NetSuite: Feature & Pricing Comparison',
    description: 'Oru ERP vs NetSuite comparison. Modern alternative to NetSuite at 1/3 the cost.',
    keywords: 'oru vs netsuite, netsuite alternative, cloud erp, enterprise resource planning'
  },
  '/compare/hubspot': {
    title: 'Oru ERP vs HubSpot: Complete Business Comparison',
    description: 'Oru ERP vs HubSpot. Full ERP platform vs CRM - which fits your agency better?',
    keywords: 'oru vs hubspot, hubspot alternative, crm vs erp, hubspot comparison'
  },
  '/compare/asana': {
    title: 'Oru ERP vs Asana: Project Management vs Full ERP',
    description: 'Oru ERP vs Asana comparison. Complete ERP vs task management - features and pricing.',
    keywords: 'oru vs asana, asana alternative, project management, task management software'
  },
  '/compare/clickup': {
    title: 'Oru ERP vs ClickUp: Full Platform Comparison',
    description: 'Oru ERP vs ClickUp comparison. ERP platform vs all-in-one workspace management.',
    keywords: 'oru vs clickup, clickup alternative, project management, workspace software'
  },
  '/compare/freshworks': {
    title: 'Oru ERP vs Freshworks: Business Software Comparison',
    description: 'Oru ERP vs Freshworks comparison. Complete ERP vs customer engagement platform.',
    keywords: 'oru vs freshworks, freshworks alternative, customer engagement, erp software'
  }
};

// Generate minimal HTML template with injected meta tags
function generateSPAHtml(title: string, description: string, keywords: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title}</title>
    <meta name="description" content="${description}" />
    <meta name="keywords" content="${keywords}" />
    <meta name="theme-color" content="#1e293b" />
    <link rel="icon" type="image/svg+xml" href="/images/landing/light.svg" />
    <script type="module" src="/assets/index-rnMflQzt.js"></script>
    <link rel="stylesheet" href="/assets/style-D1T164RD.js">
</head>
<body>
    <div id="root"></div>
    <script>
        // React SPA will mount here
    </script>
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

        if (meta) {
            // Return HTML with injected meta tags for SEO pages
            const html = generateSPAHtml(meta.title, meta.description, meta.keywords);
            return reply.type('text/html').send(html);
        }

        // For unmapped routes, use static file serving from frontend
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
