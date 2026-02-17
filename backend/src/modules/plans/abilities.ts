
import { AbilityBuilder, createMongoAbility } from '@casl/ability';
import { AppAbility, Actions, Subjects } from '../../plugins/casl.js';

export function defineAbilitiesForPlans(user: any) {
    const { can, build } = new AbilityBuilder<AppAbility>(createMongoAbility);

    if (user.roles.includes('super_admin')) {
        can('manage', 'Catalog'); // Groups plans under catalog for simplicity or use 'System'
    }

    return build();
}
