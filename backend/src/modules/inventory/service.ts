import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, and, ilike, or, SQL, sql, desc } from 'drizzle-orm';
import { warehouses, products, inventory, inventoryTransactions } from './schema.js';
import { ProductFilters, NewWarehouse, NewProduct, NewInventoryTransaction } from './types.js';

export class InventoryService {
    constructor(
        private db: NodePgDatabase<any> | any,
        private agencyId: string
    ) { }

    // --- WAREHOUSES ---

    async getWarehouses() {
        const data = await this.db.select()
            .from(warehouses)
            .where(eq(warehouses.agencyId, this.agencyId))
            .orderBy(desc(warehouses.isPrimary), warehouses.name);
        return data;
    }

    async createWarehouse(data: NewWarehouse) {
        const [warehouse] = await this.db.insert(warehouses).values({
            ...data,
            agencyId: this.agencyId
        }).returning();
        return warehouse;
    }

    // --- PRODUCTS ---

    async getProducts(filters?: ProductFilters) {
        const conditions: SQL[] = [eq(products.agencyId, this.agencyId)];
        
        if (filters?.categoryId) {
            conditions.push(eq(products.categoryId, filters.categoryId));
        }
        
        if (filters?.isActive !== undefined) {
            conditions.push(eq(products.isActive, filters.isActive));
        }
        
        if (filters?.search) {
            conditions.push(or(
                ilike(products.name, `%${filters.search}%`),
                ilike(products.sku, `%${filters.search}%`),
                ilike(products.barcode, `%${filters.search}%`)
            ) as SQL);
        }

        let query = this.db.select().from(products).where(and(...conditions)).orderBy(desc(products.createdAt));
        if (filters?.limit) query = query.limit(filters.limit);
        
        const data = await query;
        return data;
    }

    async getProduct(id: string) {
        const [product] = await this.db.select().from(products).where(and(eq(products.id, id), eq(products.agencyId, this.agencyId)));
        if (!product) throw new Error('Product not found');
        return product;
    }

    async createProduct(data: NewProduct) {
        const [product] = await this.db.insert(products).values({
            ...data,
            agencyId: this.agencyId
        }).returning();
        return product;
    }

    async updateProduct(id: string, data: Partial<NewProduct>) {
        const [product] = await this.db.update(products)
            .set({ ...data, updatedAt: new Date() })
            .where(and(eq(products.id, id), eq(products.agencyId, this.agencyId)))
            .returning();
        return product;
    }

    // --- STOCK & INVENTORY ---

    async getStockLevel(productId: string, warehouseId?: string) {
        const conditions: SQL[] = [eq(inventory.agencyId, this.agencyId), eq(inventory.productId, productId)];
        if (warehouseId) {
            conditions.push(eq(inventory.warehouseId, warehouseId));
        }
        
        const data = await this.db.select({
            inventory: inventory,
            productName: products.name,
            productSku: products.sku,
            warehouseName: warehouses.name,
            warehouseCode: warehouses.code,
        })
        .from(inventory)
        .innerJoin(products, eq(inventory.productId, products.id))
        .innerJoin(warehouses, eq(inventory.warehouseId, warehouses.id))
        .where(and(...conditions));
        
        return data;
    }

    async addStockEntry(data: NewInventoryTransaction, userId: string) {
        return await this.db.transaction(async (tx: any) => {
            // Get or create inventory record
            let [inv] = await tx.select().from(inventory).where(and(
                eq(inventory.productId, data.inventoryId), // note: we use inventoryId field to hold productId in this parameter for convenience
                eq(inventory.warehouseId, data.fromWarehouseId || data.toWarehouseId || ''),
                eq(inventory.agencyId, this.agencyId)
            ));

            if (!inv) {
                const targetWarehouseId = data.toWarehouseId || data.fromWarehouseId;
                if (!targetWarehouseId) throw new Error("Warehouse ID is required");
                
                [inv] = await tx.insert(inventory).values({
                    agencyId: this.agencyId,
                    productId: data.inventoryId,
                    warehouseId: targetWarehouseId,
                    quantity: '0',
                    reservedQuantity: '0',
                    availableQuantity: '0'
                }).returning();
            }

            // Calculate new quantity
            let currentQty = parseFloat(inv.quantity);
            let changeQty = parseFloat(data.quantity);
            
            if (data.transactionType === 'OUT') {
                if (currentQty < changeQty) throw new Error('Insufficient stock');
                currentQty -= changeQty;
            } else if (data.transactionType === 'IN' || data.transactionType === 'RETURN') {
                currentQty += changeQty;
            } else if (data.transactionType === 'ADJUSTMENT') {
                currentQty = changeQty;
            }

            // Update inventory
            await tx.update(inventory).set({
                quantity: currentQty.toString(),
                availableQuantity: (currentQty - parseFloat(inv.reservedQuantity)).toString(),
                lastMovementDate: new Date(),
                updatedAt: new Date()
            }).where(eq(inventory.id, inv.id));

            // Create transaction record
            const [transaction] = await tx.insert(inventoryTransactions).values({
                ...data,
                inventoryId: inv.id,
                agencyId: this.agencyId,
                createdBy: userId
            }).returning();

            return transaction;
        });
    }

    async getLowStockAlerts() {
        const data = await this.db.select({
            id: inventory.id,
            productId: inventory.productId,
            warehouseId: inventory.warehouseId,
            productName: products.name,
            productSku: products.sku,
            warehouseName: warehouses.name,
            quantity: inventory.quantity,
            availableQuantity: inventory.availableQuantity,
            reorderPoint: inventory.reorderPoint,
            shortage: sql<number>`CAST(${inventory.reorderPoint} AS numeric) - CAST(${inventory.availableQuantity} AS numeric)`
        })
        .from(inventory)
        .innerJoin(products, eq(inventory.productId, products.id))
        .innerJoin(warehouses, eq(inventory.warehouseId, warehouses.id))
        .where(and(
            eq(inventory.agencyId, this.agencyId),
            sql`CAST(${inventory.availableQuantity} AS numeric) <= CAST(${inventory.reorderPoint} AS numeric)`,
            sql`CAST(${inventory.reorderPoint} AS numeric) > 0`
        ))
        .orderBy(desc(sql`CAST(${inventory.reorderPoint} AS numeric) - CAST(${inventory.availableQuantity} AS numeric)`));
        
        return data;
    }
}
