import { FastifyPluginAsync, FastifyRequest } from 'fastify';
import { FinanceService } from './service.js';
import { mapToSnakeCase } from '../../utils/case-transform.js';
import { ForbiddenError } from '../../utils/errors.js';

const financeRoutes: FastifyPluginAsync = async (fastify) => {
    const svc = (req: FastifyRequest) =>
        new FinanceService((req as any).agencyDb || fastify.db, req.user.agencyId as string);

    // --- CURRENCIES ---

    fastify.get('/currencies', { onRequest: [fastify.authenticate] }, async (request) => {
        // Anyone can read currencies
        return { success: true, data: (await svc(request).getCurrencies()).map((d: any) => mapToSnakeCase(d)) };
    });

    fastify.get('/currencies/base', { onRequest: [fastify.authenticate] }, async (request) => {
        return { success: true, data: mapToSnakeCase(await svc(request).getBaseCurrency()) };
    });

    // --- BANK ACCOUNTS ---

    fastify.get('/bank-accounts', { onRequest: [fastify.authenticate] }, async (request) => {
        if (request.ability.cannot('read', 'BankReconciliation')) throw new ForbiddenError();
        return { success: true, data: (await svc(request).getBankAccounts()).map((d: any) => mapToSnakeCase(d)) };
    });

    fastify.post('/bank-accounts', { onRequest: [fastify.authenticate] }, async (request, reply) => {
        if (request.ability.cannot('manage', 'BankReconciliation')) throw new ForbiddenError();
        return reply.code(201).send({ success: true, data: mapToSnakeCase(await svc(request).createBankAccount(request.body as any)) });
    });

    // --- RECONCILIATION ---

    fastify.get('/reconciliation/unreconciled', { onRequest: [fastify.authenticate] }, async (request) => {
        if (request.ability.cannot('read', 'BankReconciliation')) throw new ForbiddenError();
        return { success: true, data: (await svc(request).getUnreconciledTransactions(request.query as any)).map((d: any) => mapToSnakeCase(d)) };
    });

    fastify.post('/reconciliation/reconcile', { onRequest: [fastify.authenticate] }, async (request, reply) => {
        if (request.ability.cannot('manage', 'BankReconciliation')) throw new ForbiddenError();
        const { accountId, transactionIds, statementBalance } = request.body as any;
        return reply.code(201).send({ 
            success: true, 
            data: mapToSnakeCase(await svc(request).reconcileTransactions(accountId, transactionIds, statementBalance, request.user.id as string)) 
        });
    });

    // --- BUDGETS ---

    fastify.get('/budgets', { onRequest: [fastify.authenticate] }, async (request) => {
        if (request.ability.cannot('read', 'Budget')) throw new ForbiddenError();
        return { success: true, data: (await svc(request).getBudgets(request.query as any)).map((d: any) => mapToSnakeCase(d)) };
    });

    fastify.get('/budgets/:id', { onRequest: [fastify.authenticate] }, async (request) => {
        if (request.ability.cannot('read', 'Budget')) throw new ForbiddenError();
        const { id } = request.params as { id: string };
        const budget = await svc(request).getBudget(id);
        const items = await svc(request).getBudgetItems(id);
        return { success: true, data: { ...mapToSnakeCase(budget), items: items.map((i: any) => mapToSnakeCase(i)) } };
    });

    fastify.post('/budgets', { onRequest: [fastify.authenticate] }, async (request, reply) => {
        if (request.ability.cannot('manage', 'Budget')) throw new ForbiddenError();
        const { items, ...budgetData } = request.body as any;
        // In real app, createdBy should be passed to createBudget
        return reply.code(201).send({ success: true, data: mapToSnakeCase(await svc(request).createBudget(budgetData, items || [])) });
    });
};

export default financeRoutes;
