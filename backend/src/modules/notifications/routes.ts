
import { FastifyPluginAsync } from 'fastify';
import { NotificationsService } from './service.js';
import { listNotificationsQuerySchema, notificationsResponseSchema, unreadCountResponseSchema } from './schemas.js';
import { mapToSnakeCase } from '../../utils/case-transform.js';

const notificationRoutes: FastifyPluginAsync = async (fastify) => {
    const service = new NotificationsService(fastify.log);

    // GET / - List notifications
    fastify.get('/', {
        onRequest: [fastify.authenticate],
    }, async (request, reply) => {
        try {
            const query = listNotificationsQuerySchema.parse(request.query);
            const rawData = await service.list(query, request.user.id);
            const response = notificationsResponseSchema.parse(rawData);
            return { success: true, data: response };
        } catch (error) {
            fastify.log.error(error);
            throw error;
        }
    });

    // GET /unread-count - Count unread
    fastify.get('/unread-count', {
        onRequest: [fastify.authenticate],
    }, async (request, reply) => {
        try {
            const count = await service.getUnreadCount(request.user.id);
            return { success: true, data: { unreadCount: count } };
        } catch (error) {
            fastify.log.error(error);
            throw error;
        }
    });

    // PUT /:id/read - Mark as read
    fastify.put('/:id/read', {
        onRequest: [fastify.authenticate],
    }, async (request, reply) => {
        const { id } = request.params as { id: string };
        try {
            await service.markAsRead(id, request.user.id);
            return { success: true, message: 'Notification marked as read' };
        } catch (error) {
            fastify.log.error(error);
            throw error;
        }
    });

    // PUT /read-all - Mark all as read
    fastify.put('/read-all', {
        onRequest: [fastify.authenticate],
    }, async (request, reply) => {
        try {
            const result = await service.markAllAsRead(request.user.id);
            return { success: true, data: result };
        } catch (error) {
            fastify.log.error(error);
            throw error;
        }
    });

    // DELETE /:id - Delete notification
    fastify.delete('/:id', {
        onRequest: [fastify.authenticate],
    }, async (request, reply) => {
        const { id } = request.params as { id: string };
        try {
            await service.delete(id, request.user.id);
            return { success: true, message: 'Notification deleted' };
        } catch (error) {
            fastify.log.error(error);
            throw error;
        }
    });
};

export default notificationRoutes;
