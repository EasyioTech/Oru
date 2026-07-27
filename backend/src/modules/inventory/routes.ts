import { FastifyPluginAsync, FastifyRequest } from 'fastify';
import { InventoryService } from './service.js';
import { mapToSnakeCase } from '../../utils/case-transform.js';
import { ForbiddenError } from '../../utils/errors.js';

const inventoryRoutes: FastifyPluginAsync = async (fastify) => {
    const svc = (req: FastifyRequest) =>
        new InventoryService((req as any).agencyDb || fastify.db, req.user.agencyId as string);

    // --- WAREHOUSES ---

    fastify.get('/warehouses', { onRequest: [fastify.authenticate] }, async (request) => {
        if (request.ability.cannot('read', 'Warehouse')) throw new ForbiddenError();
        return { success: true, data: (await svc(request).getWarehouses()).map((d: any) => mapToSnakeCase(d)) };
    });

    fastify.post('/warehouses', { onRequest: [fastify.authenticate] }, async (request, reply) => {
        if (request.ability.cannot('create', 'Warehouse')) throw new ForbiddenError();
        return reply.code(201).send({ success: true, data: mapToSnakeCase(await svc(request).createWarehouse(request.body as any)) });
    });

    // --- PRODUCTS ---

    fastify.get('/products', { onRequest: [fastify.authenticate] }, async (request) => {
        if (request.ability.cannot('read', 'Product')) throw new ForbiddenError();
        return { success: true, data: (await svc(request).getProducts(request.query as any)).map((d: any) => mapToSnakeCase(d)) };
    });

    fastify.get('/products/:id', { onRequest: [fastify.authenticate] }, async (request) => {
        if (request.ability.cannot('read', 'Product')) throw new ForbiddenError();
        const { id } = request.params as { id: string };
        return { success: true, data: mapToSnakeCase(await svc(request).getProduct(id)) };
    });

    fastify.post('/products', { onRequest: [fastify.authenticate] }, async (request, reply) => {
        if (request.ability.cannot('create', 'Product')) throw new ForbiddenError();
        return reply.code(201).send({ success: true, data: mapToSnakeCase(await svc(request).createProduct(request.body as any)) });
    });

    fastify.put('/products/:id', { onRequest: [fastify.authenticate] }, async (request) => {
        if (request.ability.cannot('update', 'Product')) throw new ForbiddenError();
        const { id } = request.params as { id: string };
        return { success: true, data: mapToSnakeCase(await svc(request).updateProduct(id, request.body as any)) };
    });

    // --- STOCK ---

    fastify.post('/stock/entry', { onRequest: [fastify.authenticate] }, async (request, reply) => {
        if (request.ability.cannot('create', 'StockEntry')) throw new ForbiddenError();
        return reply.code(201).send({ success: true, data: mapToSnakeCase(await svc(request).addStockEntry(request.body as any, request.user.id as string)) });
    });

    fastify.get('/stock/levels', { onRequest: [fastify.authenticate] }, async (request) => {
        if (request.ability.cannot('read', 'StockEntry')) throw new ForbiddenError();
        const { productId, warehouseId } = request.query as any;
        return { success: true, data: (await svc(request).getStockLevel(productId, warehouseId)).map((d: any) => mapToSnakeCase(d)) };
    });

    fastify.get('/alerts/low-stock', { onRequest: [fastify.authenticate] }, async (request) => {
        if (request.ability.cannot('read', 'Product')) throw new ForbiddenError();
        return { success: true, data: (await svc(request).getLowStockAlerts()).map((d: any) => mapToSnakeCase(d)) };
    });
};

export default inventoryRoutes;
