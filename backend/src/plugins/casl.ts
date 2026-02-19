

import fp from 'fastify-plugin';
import { createMongoAbility, MongoAbility, AbilityBuilder } from '@casl/ability';
import { FastifyPluginAsync } from 'fastify';

export type Actions = 'manage' | 'create' | 'read' | 'update' | 'delete';
export type Subjects = 'Agency' | 'User' | 'System' | 'Catalog' | 'Ticket' | 'Project' | 'Client' | 'all';

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

        if (roles.includes('super_admin')) {
            can('manage', 'all');
        } else if (roles.includes('agency_admin')) {
            // Agency Admins can manage their own resources
            can('manage', 'Agency');
            can('manage', 'User');
            can('manage', 'Ticket');
            can('manage', 'Project');
            can('manage', 'Client');
            can('read', 'System');
        }

        // TODO: Add more role mappings as needed

        request.ability = build();
    });
};

export default fp(caslPlugin);
