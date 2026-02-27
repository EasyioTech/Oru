import { FastifyPluginAsync } from 'fastify';
import { AuthService } from './service.js';
import {
    registerSchema,
    loginSchema,
    refreshTokenSchema,
    enable2FASchema,
} from './schemas.js';

const authRoutes: FastifyPluginAsync = async (fastify) => {
    const authService = new AuthService(fastify);

    fastify.post('/register', async (request, reply) => {
        // Validate with Zod
        const validatedData = registerSchema.parse(request.body);
        const result = await authService.register(validatedData);
        return reply.code(201).send(result);
    });

    fastify.post('/login', async (request, reply) => {
        const validatedData = loginSchema.parse(request.body);
        const result = await authService.login(validatedData);
        return reply.send(result);
    });

    fastify.post('/sauth', async (request, reply) => {
        const validatedData = loginSchema.parse(request.body);
        const result = await authService.loginSauth(validatedData);
        return reply.send(result);
    });

    fastify.post('/refresh', async (request, reply) => {
        const validatedData = refreshTokenSchema.parse(request.body);
        const result = await authService.refreshToken(validatedData.refreshToken);
        return reply.send(result);
    });

    fastify.post('/2fa/enable', {
        onRequest: [fastify.authenticate],
    }, async (request, reply) => {
        const result = await authService.enable2FA(request.user.id);
        return reply.send(result);
    });

    fastify.post('/2fa/verify', {
        onRequest: [fastify.authenticate],
    }, async (request, reply) => {
        const validatedData = enable2FASchema.parse(request.body);
        const result = await authService.verify2FA(request.user.id, validatedData.totpCode);
        return reply.send(result);
    });

    fastify.get('/me', {
        onRequest: [fastify.authenticate],
    }, async (request, reply) => {
        const user = await authService.getCurrentUser(request.user.id);
        return reply.send({ success: true, user });
    });
};

export default authRoutes;
