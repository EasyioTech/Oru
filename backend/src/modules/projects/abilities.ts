import { AbilityBuilder, createMongoAbility, ExtractSubjectType } from '@casl/ability';

export function defineProjectAbilities(user: any) {
    const { can, cannot, build } = new AbilityBuilder(createMongoAbility);
    
    if (user.roles.includes('super_admin') || user.roles.includes('agency_admin') || user.roles.includes('manager')) {
        can('manage', 'Project');
        can('manage', 'Task');
    } else {
        can('read', 'Project');
        can('read', 'Task');
        can(['create', 'update'], 'Task'); // employees can manage their own tasks
    }
    
    if (user.roles.includes('viewer')) {
        cannot('create', 'Project');
        cannot('delete', 'Project');
    }

    return build();
}
