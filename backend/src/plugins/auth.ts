import fp from 'fastify-plugin';
import jwt from '@fastify/jwt';
import { FastifyRequest, FastifyReply } from 'fastify';

declare module 'fastify' {
    interface FastifyInstance {
        authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    }
}

declare module '@fastify/jwt' {
    interface FastifyJWT {
        user: {
            id: string;
            email: string;
            roles: string[];
            agencyId?: string;
        };
    }
}

export default fp(async (fastify) => {
    fastify.register(jwt, {
        secret: process.env.JWT_SECRET!,
        sign: {
            expiresIn: process.env.JWT_ACCESS_EXPIRY || '15m',
        },
    });

    fastify.decorate('authenticate', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            await request.jwtVerify();
        } catch (err) {
            reply.code(401).send({ error: 'Unauthorized', message: 'Invalid or expired token' });
        }
    });
});
