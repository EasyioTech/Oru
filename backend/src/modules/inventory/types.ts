import { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { warehouses, products, productCategories, inventory, inventoryTransactions } from './schema.js';

export type Warehouse = InferSelectModel<typeof warehouses>;
export type NewWarehouse = InferInsertModel<typeof warehouses>;

export type Product = InferSelectModel<typeof products>;
export type NewProduct = InferInsertModel<typeof products>;

export type ProductCategory = InferSelectModel<typeof productCategories>;
export type NewProductCategory = InferInsertModel<typeof productCategories>;

export type Inventory = InferSelectModel<typeof inventory>;
export type NewInventory = InferInsertModel<typeof inventory>;

export type InventoryTransaction = InferSelectModel<typeof inventoryTransactions>;
export type NewInventoryTransaction = InferInsertModel<typeof inventoryTransactions>;

export interface ProductFilters {
    categoryId?: string;
    isActive?: boolean;
    search?: string;
    limit?: number;
}

export interface InventoryTransactionFilters {
    productId?: string;
    warehouseId?: string;
    transactionType?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
}
