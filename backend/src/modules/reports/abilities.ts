import { AbilityBuilder, createMongoAbility } from '@casl/ability';

export function defineReportAbilities(user: any) {
    const { can, build } = new AbilityBuilder(createMongoAbility);
    
    // Most users can read reports if they have basic access,
    // actual data access is controlled by underlying module abilities
    can('read', 'all'); 
    
    if (user.roles.includes('super_admin') || user.roles.includes('agency_admin') || user.roles.includes('manager')) {
        can('manage', 'all');
    }
    
    return build();
}
