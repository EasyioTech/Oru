
import { AbilityBuilder, createMongoAbility } from '@casl/ability';
import { AppAbility, Actions, Subjects } from '../../plugins/casl.js';

export function defineAbilitiesForCatalog(user: any) {
    const { can, build } = new AbilityBuilder<AppAbility>(createMongoAbility);

    if (user.roles.includes('super_admin')) {
        can('manage', 'Catalog');
    }

    return build();
}
