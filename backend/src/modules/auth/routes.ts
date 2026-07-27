import { FastifyPluginAsync } from 'fastify';
import { AuthService } from './service.js';
import {
    registerSchema,
    loginSchema,
    refreshTokenSchema,
    enable2FASchema,
    agencySignupSchema,
} from './schemas.js';

const authRoutes: FastifyPluginAsync = async (fastify) => {
    // Rate limit: 5 requests per hour per IP for agency signup (prevents abuse)
    fastify.post('/agency-signup', {
        config: {
            rateLimit: {
                max: 5,
                timeWindow: '1 hour',
            }
        }
    }, async (request, reply) => {
        const authService = new AuthService(fastify.db, fastify.jwt, request.log);
        const data = agencySignupSchema.parse(request.body);
        const result = await authService.agencySignup(data);
        return reply.code(201).send({ success: true, data: result });
    });

    fastify.post('/register', async (request, reply) => {
        const authService = new AuthService(fastify.db, fastify.jwt, request.log);
        // Validate with Zod
        const validatedData = registerSchema.parse(request.body);
        const result = await authService.register(validatedData);
        return reply.code(201).send(result);
    });

    fastify.post('/login', async (request, reply) => {
        const authService = new AuthService(fastify.db, fastify.jwt, request.log);
        const validatedData = loginSchema.parse(request.body);
        const result = await authService.login(validatedData);
        return reply.send(result);
    });

    fastify.post('/sauth', async (request, reply) => {
        const authService = new AuthService(fastify.db, fastify.jwt, request.log);
        const validatedData = loginSchema.parse(request.body);
        const result = await authService.loginSauth(validatedData);
        return reply.send(result);
    });

    fastify.post('/refresh', async (request, reply) => {
        const authService = new AuthService(fastify.db, fastify.jwt, request.log);
        const validatedData = refreshTokenSchema.parse(request.body);
        const result = await authService.refreshToken(validatedData.refreshToken);
        return reply.send(result);
    });

    fastify.post('/2fa/enable', { onRequest: [fastify.authenticate] }, async (_request, reply) => {
        return reply.code(501).send({ success: false, message: '2FA not implemented yet' });
    });

    fastify.post('/2fa/verify', { onRequest: [fastify.authenticate] }, async (_request, reply) => {
        return reply.code(501).send({ success: false, message: '2FA not implemented yet' });
    });

    fastify.get('/me', {
        onRequest: [fastify.authenticate],
    }, async (request, reply) => {
        const authService = new AuthService(fastify.db, fastify.jwt, request.log);
        const user = await authService.getCurrentUser(request.user.id);
        return reply.send({ success: true, user });
    });
};

export default authRoutes;
