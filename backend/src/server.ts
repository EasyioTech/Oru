import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import multipart from '@fastify/multipart';
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
});

// --- Plugins ---
await server.register(dbPlugin);
await server.register(authPlugin);
await server.register(caslPlugin);
await server.register(helmet);
await server.register(multipart, {
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    }
});

// --- Swagger Documentation ---
await server.register(swaggerPlugin);

// --- Routes ---
await server.register(autoLoad, {
    dir: path.join(__dirname, 'modules'),
    options: { prefix: '/api' },
    indexPattern: /^routes\.[jt]s$/,
    ignorePattern: /schemas\.ts$|service\.ts$|abilities\.ts$/,
});

await server.register(cors, {
    origin: (origin, cb) => {
        const allowedOrigins = [
            'http://localhost:5173',
            'http://localhost:3000',
            'https://orutest.site',
            'https://www.orutest.site'
        ];
        if (!origin || allowedOrigins.includes(origin)) {
            cb(null, true);
        } else {
            cb(null, true); // Allow all in development
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
        'Content-Type',
        'Authorization',
        'x-agency-database',
        'X-Agency-Database',
        'Accept',
        'Origin',
        'X-Requested-With'
    ],
    exposedHeaders: ['Content-Length', 'X-Request-Id'],
});
await server.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',
});

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
        await server.close();
        await closeAllPools();
        process.exit(0);
    });
});

start();
