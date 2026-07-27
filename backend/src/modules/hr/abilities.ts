import { AbilityBuilder, createMongoAbility } from '@casl/ability';

export function defineHrAbilities(role: string) {
    const { can, build } = new AbilityBuilder(createMongoAbility);
    if (role === 'super_admin' || role === 'agency_admin' || role === 'manager') {
        can('manage', 'Department');
        can('manage', 'Employee');
        can('manage', 'LeaveRequest');
    } else {
        can('read', 'Department');
        can('read', 'Employee');
        can('read', 'LeaveRequest');
        can('create', 'LeaveRequest');
    }
    return build();
}
