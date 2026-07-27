import { AbilityBuilder, createMongoAbility } from '@casl/ability';

export function defineFinanceAbilities(user: any) {
    const { can, cannot, build } = new AbilityBuilder(createMongoAbility);
    
    if (user.roles.includes('super_admin') || user.roles.includes('agency_admin') || user.roles.includes('finance_manager')) {
        can('manage', 'Budget');
        can('manage', 'BankReconciliation');
    } else {
        can('read', 'Budget');
        can('read', 'BankReconciliation');
    }
    
    return build();
}
