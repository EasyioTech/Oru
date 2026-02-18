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

// --- Plugins ---
await server.register(cors, {

    origin: (origin, cb) => {
        const defaultOrigins = [
            'http://localhost:5173',
            'http://localhost:5001',
            'http://127.0.0.1:5173',
            'http://127.0.0.1:5001',
            'https://orutest.site',
            'https://www.orutest.site'
        ];

        const envOrigins = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : [];
        const allowedOrigins = [...defaultOrigins, ...envOrigins];

        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return cb(null, true);

        if (allowedOrigins.indexOf(origin) !== -1 || origin.includes('localhost')) {
            cb(null, true);
        } else {
            // Log blocked origin for debugging
            server.log.warn(`Blocked CORS request from origin: ${origin}`);
            cb(new Error("Not allowed by CORS"), false);
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Agency-Database', 'Accept', 'Origin', 'X-Requested-With', 'Idempotency-Key'],
    exposedHeaders: ['Content-Length', 'X-Request-Id'],
});
await server.register(helmet, {
    crossOriginResourcePolicy: { policy: "cross-origin" },
});
await server.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',
});
await server.register(multipart, {
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    }
});

// Serve uploaded files statically
await server.register(fastifyStatic, {
    root: path.join(process.cwd(), 'uploads'),
    prefix: '/uploads/',
    decorateReply: false // Avoid conflict if already decorated by something else (though usually safe)
});

await server.register(dbPlugin);
await server.register(authPlugin);
await server.register(caslPlugin);

// --- Swagger Documentation ---
await server.register(swaggerPlugin);

// --- Routes ---
await server.register(autoLoad, {
    dir: path.join(__dirname, 'modules'),
    options: { prefix: '/api' },
    indexPattern: /^routes\.[jt]s$/,
    ignorePattern: /schemas\.ts$|service\.ts$|abilities\.ts$/,
});

// --- Serve Frontend in Production ---
if (process.env.NODE_ENV === 'production') {
    const frontendDist = path.join(process.cwd(), '../frontend/dist');
    server.log.info(`Serve frontend from: ${frontendDist}`);

    try {
        await server.register(fastifyStatic, {
            root: frontendDist,
            prefix: '/',
            wildcard: false, // Handle wildcard manually
            decorateReply: false, // avoided conflict with uploads static
        });

        // SPA Fallback
        server.setNotFoundHandler(async (request, reply) => {
            // API 404
            if (request.raw.url && request.raw.url.startsWith('/api')) {
                return reply.status(404).send({
                    error: true,
                    message: 'Route not found',
                    code: 'NOT_FOUND',
                });
            }
            // Frontend generic 404 -> index.html
            return reply.sendFile('index.html', frontendDist);
        });
    } catch (e) {
        server.log.error(`Failed to register frontend static files: ${e}`);
    }
}


// --- Global Error Handler ---
server.setErrorHandler((error: any, request, reply) => {
    server.log.error(error);
    reply.status(error.statusCode || 500).send({
        error: true,
        message: error.message || 'Internal Server Error',
        code: error.code || 'INTERNAL_ERROR',
    });
});

// --- Health Check ---
server.get('/health', async () => {
    return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    };
});


// --- Startup ---
const start = async () => {
    try {
        const port = parseInt(process.env.PORT || '5001');
        await server.listen({ port, host: '0.0.0.0' });

        // Initialize Workers
        const { initWorkers } = await import('./jobs/worker.js');
        const workers = initWorkers(server.log); // keep reference if needed for shutdown

        // Store workers on server instance or global for graceful shutdown
        (global as any).workers = workers;

        server.log.info(`🚀 Oru High-Tech ERP is soaring on port ${port}`);
    } catch (err) {
        server.log.error(err);
        process.exit(1);
    }
};

// --- Graceful Shutdown ---
const signals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM'];
signals.forEach((signal) => {
    process.on(signal, async () => {
        server.log.info(`Received ${signal}, shutting down gracefully...`);

        // Close Workers
        const workers = (global as any).workers;
        if (workers) {
            await Promise.all(workers.map((w: any) => w.close()));
        }

        await server.close();
        await closeAllPools();
        process.exit(0);
    });
});

start();

