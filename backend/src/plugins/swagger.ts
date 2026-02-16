import fp from 'fastify-plugin';
import swagger, { FastifySwaggerOptions } from '@fastify/swagger';
import swaggerUi, { FastifySwaggerUiOptions } from '@fastify/swagger-ui';
import { FastifyPluginAsync } from 'fastify';

const swaggerPlugin: FastifyPluginAsync = async (fastify) => {
    // Register Swagger Core
    await fastify.register(swagger, {
        openapi: {
            info: {
                title: 'Oru ERP API',
                description: 'API documentation for Oru ERP System',
                version: '1.0.0',
            },
            servers: [
                {
                    url: 'http://localhost:5001',
                    description: 'Development server'
                }
            ],
            components: {
                securitySchemes: {
                    bearerAuth: {
                        type: 'http',
                        scheme: 'bearer',
                        bearerFormat: 'JWT'
                    }
                }
            },
            security: [{ bearerAuth: [] }]
        }
    } as any);

    // Register Swagger UI
    await fastify.register(swaggerUi, {
        routePrefix: '/documentation',
        uiConfig: {
            docExpansion: 'list',
            deepLinking: false,
        },
        staticCSP: true,
        transformStaticCSP: (header) => header,
    } as FastifySwaggerUiOptions);
};

export default fp(swaggerPlugin);
