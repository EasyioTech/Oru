
import { AbilityBuilder, createMongoAbility } from '@casl/ability';
import type { AppAbility } from '../../plugins/casl.js';

export function defineAbilitiesForTickets(user: any) {
    const { can, build } = new AbilityBuilder<AppAbility>(createMongoAbility);

    if (user.roles.includes('super_admin')) {
        can('manage', 'Ticket');
    }

    return build();
}
