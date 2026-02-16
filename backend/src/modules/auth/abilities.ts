
import { AbilityBuilder, createMongoAbility } from '@casl/ability';
import { AppAbility, Actions, Subjects } from '../../plugins/casl.js';

export function defineAbilitiesForAuth(user: any) {
    const { can, build } = new AbilityBuilder<AppAbility>(createMongoAbility);

    // Super Admin can do everything
    if (user.roles.includes('super_admin')) {
        can('manage', 'all');
    }

    return build();
}
