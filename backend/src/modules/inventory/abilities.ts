import { AbilityBuilder, createMongoAbility } from '@casl/ability';

export function defineInventoryAbilities(user: any) {
    const { can, cannot, build } = new AbilityBuilder(createMongoAbility);
    
    if (user.roles.includes('super_admin') || user.roles.includes('agency_admin') || user.roles.includes('manager')) {
        can('manage', 'Warehouse');
        can('manage', 'Product');
        can('manage', 'StockEntry');
    } else {
        can('read', 'Warehouse');
        can('read', 'Product');
        can('read', 'StockEntry');
    }
    
    return build();
}
