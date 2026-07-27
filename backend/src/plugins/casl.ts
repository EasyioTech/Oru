

import fp from 'fastify-plugin';
import { createMongoAbility, MongoAbility, AbilityBuilder } from '@casl/ability';
import { FastifyPluginAsync } from 'fastify';

export type Actions = 'manage' | 'create' | 'read' | 'update' | 'delete';
export type Subjects = 'Agency' | 'User' | 'System' | 'Catalog' | 'Ticket' | 'Project' | 'Task' | 'Client' | 'Lead' | 'CRMActivity' | 'Department' | 'Employee' | 'LeaveRequest' | 'Warehouse' | 'Product' | 'StockEntry' | 'Supplier' | 'PurchaseRequisition' | 'PurchaseOrder' | 'GoodsReceipt' | 'Budget' | 'BankReconciliation' | 'all';

export type AppAbility = MongoAbility<[Actions, Subjects]>;

declare module 'fastify' {
    interface FastifyRequest {
        ability: AppAbility;
    }
}

const caslPlugin: FastifyPluginAsync = async (fastify) => {
    fastify.addHook('preHandler', async (request) => {
        const { can, build } = new AbilityBuilder<AppAbility>(createMongoAbility);

        // Map roles to permissions
        const roles = request.user?.roles || [];

        // If no user/roles, they can't do much but we shouldn't crash
        if (roles.length === 0) {
            request.ability = build();
            return;
        }

        if (roles.includes('super_admin')) {
            can('manage', 'all');
        } else if (roles.includes('agency_admin')) {
            // Agency Admins can manage their own resources
            can('manage', 'all'); // Agency admins can manage everything within their agency context
        } else if (roles.includes('manager')) {
            can('manage', 'Project');
            can('manage', 'Client');
            can('manage', 'Lead');
            can('manage', 'CRMActivity');
            can('read', 'Employee');
            can('read', 'Department');
            can('read', 'User');
            can('read', 'Agency');
        } else if (roles.includes('employee')) {
            can('read', 'Project');
            can('read', 'Client');
            can('read', 'Lead');
            can('create', 'CRMActivity');
            can('read', 'CRMActivity');
            can('update', 'CRMActivity');
            can('read', 'Employee');
            can('read', 'Department');
            can('read', 'User');
        } else if (roles.includes('auditor') || roles.includes('viewer')) {
            can('read', 'all');
        }

        request.ability = build();
    });
};

export default fp(caslPlugin);
