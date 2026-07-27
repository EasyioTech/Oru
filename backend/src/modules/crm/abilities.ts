import { AbilityBuilder, createMongoAbility } from '@casl/ability';

export function defineCrmAbilities(role: string) {
    const { can, build } = new AbilityBuilder(createMongoAbility);
    if (role === 'super_admin' || role === 'agency_admin' || role === 'manager') {
        can('manage', 'Client');
        can('manage', 'Lead');
        can('manage', 'CRMActivity');
    } else {
        can('read', 'Client');
        can('read', 'Lead');
        can('read', 'CRMActivity');
        can('create', 'CRMActivity');
        can('update', 'CRMActivity');
    }
    return build();
}
