import { FastifyPluginAsync } from 'fastify';
import { DatabaseService } from '../database/service.js';

const inventoryRoutes: FastifyPluginAsync = async (fastify) => {
    const db = new DatabaseService(fastify.log);

    const auth = { onRequest: [fastify.authenticate] };

    const aid = (req: any): string => req.user?.agencyId || '';

    const safe = async (fn: () => Promise<any>) => {
        try { return await fn(); } catch { return []; }
    };

    // ─── Warehouses ───────────────────────────────────────────────
    fastify.get('/warehouses', auth, async (req) => {
        const rows = await safe(() => db.executeQuery(
            `SELECT * FROM inventory_warehouses WHERE agency_id=$1 AND is_active=true ORDER BY is_primary DESC, name`,
            [aid(req)]
        ));
        return { success: true, data: rows };
    });

    fastify.post('/warehouses', auth, async (req, reply) => {
        const b = req.body as any;
        const rows = await safe(() => db.executeQuery(
            `INSERT INTO inventory_warehouses
             (agency_id,code,name,address,city,state,postal_code,country,contact_person,phone,email,is_active,is_primary)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING *`,
            [aid(req), b.code, b.name, b.address, b.city, b.state, b.postal_code, b.country,
             b.contact_person, b.phone, b.email, b.is_active ?? true, b.is_primary ?? false]
        ));
        return reply.status(201).send({ success: true, data: rows[0] ?? null });
    });

    fastify.put('/warehouses/:id', auth, async (req) => {
        const { id } = req.params as any;
        const b = req.body as any;
        const rows = await safe(() => db.executeQuery(
            `UPDATE inventory_warehouses
             SET name=$2,address=$3,city=$4,state=$5,postal_code=$6,country=$7,
                 contact_person=$8,phone=$9,email=$10,is_active=$11,is_primary=$12,updated_at=NOW()
             WHERE id=$1 AND agency_id=$13 RETURNING *`,
            [id, b.name, b.address, b.city, b.state, b.postal_code, b.country,
             b.contact_person, b.phone, b.email, b.is_active, b.is_primary, aid(req)]
        ));
        return { success: true, data: rows[0] ?? null };
    });

    fastify.delete('/warehouses/:id', auth, async (req) => {
        const { id } = req.params as any;
        await safe(() => db.executeQuery(
            `UPDATE inventory_warehouses SET is_active=false WHERE id=$1 AND agency_id=$2`,
            [id, aid(req)]
        ));
        return { success: true };
    });

    // ─── Categories ───────────────────────────────────────────────
    fastify.get('/categories', auth, async (req) => {
        const rows = await safe(() => db.executeQuery(
            `SELECT * FROM inventory_product_categories WHERE agency_id=$1 ORDER BY name`,
            [aid(req)]
        ));
        return { success: true, data: rows };
    });

    fastify.post('/categories', auth, async (req, reply) => {
        const b = req.body as any;
        const rows = await safe(() => db.executeQuery(
            `INSERT INTO inventory_product_categories (agency_id,name,description,parent_id)
             VALUES ($1,$2,$3,$4) RETURNING *`,
            [aid(req), b.name, b.description, b.parent_id]
        ));
        return reply.status(201).send({ success: true, data: rows[0] ?? null });
    });

    // ─── Products ─────────────────────────────────────────────────
    fastify.get('/products', auth, async (req) => {
        const q = req.query as any;
        let sql = `SELECT p.*, c.name as category_name
                   FROM inventory_products p
                   LEFT JOIN inventory_product_categories c ON p.category_id=c.id
                   WHERE p.agency_id=$1`;
        const params: any[] = [aid(req)];
        if (q.category_id)        { params.push(q.category_id);          sql += ` AND p.category_id=$${params.length}`; }
        if (q.is_active !== undefined) { params.push(q.is_active === 'true'); sql += ` AND p.is_active=$${params.length}`; }
        if (q.search)             { params.push(`%${q.search}%`);         sql += ` AND (p.name ILIKE $${params.length} OR p.sku ILIKE $${params.length})`; }
        sql += ` ORDER BY p.name`;
        if (q.limit)              { params.push(parseInt(q.limit));        sql += ` LIMIT $${params.length}`; }
        const rows = await safe(() => db.executeQuery(sql, params));
        return { success: true, data: rows };
    });

    fastify.post('/products', auth, async (req, reply) => {
        const b = req.body as any;
        const rows = await safe(() => db.executeQuery(
            `INSERT INTO inventory_products
             (agency_id,sku,name,description,category_id,brand,unit_of_measure,barcode,qr_code,weight,dimensions,image_url,is_active,is_trackable,track_by)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15) RETURNING *`,
            [aid(req), b.sku, b.name, b.description, b.category_id, b.brand, b.unit_of_measure || 'EA',
             b.barcode, b.qr_code, b.weight, b.dimensions, b.image_url,
             b.is_active ?? true, b.is_trackable ?? false, b.track_by || 'none']
        ));
        return reply.status(201).send({ success: true, data: rows[0] ?? null });
    });

    fastify.get('/products/:id', auth, async (req) => {
        const { id } = req.params as any;
        const rows = await safe(() => db.executeQuery(
            `SELECT * FROM inventory_products WHERE id=$1 AND agency_id=$2`,
            [id, aid(req)]
        ));
        return { success: true, data: rows[0] ?? null };
    });

    fastify.put('/products/:id', auth, async (req) => {
        const { id } = req.params as any;
        const b = req.body as any;
        const rows = await safe(() => db.executeQuery(
            `UPDATE inventory_products
             SET name=$2,description=$3,category_id=$4,brand=$5,unit_of_measure=$6,
                 barcode=$7,qr_code=$8,weight=$9,dimensions=$10,image_url=$11,
                 is_active=$12,is_trackable=$13,track_by=$14,updated_at=NOW()
             WHERE id=$1 AND agency_id=$15 RETURNING *`,
            [id, b.name, b.description, b.category_id, b.brand, b.unit_of_measure,
             b.barcode, b.qr_code, b.weight, b.dimensions, b.image_url,
             b.is_active, b.is_trackable, b.track_by, aid(req)]
        ));
        return { success: true, data: rows[0] ?? null };
    });

    fastify.delete('/products/:id', auth, async (req) => {
        const { id } = req.params as any;
        await safe(() => db.executeQuery(
            `UPDATE inventory_products SET is_active=false WHERE id=$1 AND agency_id=$2`,
            [id, aid(req)]
        ));
        return { success: true };
    });

    fastify.post('/products/:id/generate-code', auth, async (req) => {
        const { id } = req.params as any;
        const { codeType = 'barcode' } = req.body as any;
        // Verify product belongs to this agency before generating code
        const rows = await safe(() => db.executeQuery(
            `SELECT id FROM inventory_products WHERE id=$1 AND agency_id=$2`,
            [id, aid(req)]
        ));
        if (!rows.length) return { success: false, error: 'Not found' };
        const code = `${String(codeType).toUpperCase()}-${id.slice(0, 8).toUpperCase()}`;
        return { success: true, data: { code } };
    });

    // ─── Inventory Levels ─────────────────────────────────────────
    fastify.get('/products/:id/levels', auth, async (req) => {
        const { id } = req.params as any;
        // agency_id guard via JOIN on products to prevent cross-agency level reads
        const rows = await safe(() => db.executeQuery(
            `SELECT il.*, p.name as product_name, p.sku as product_sku,
                    w.name as warehouse_name, w.code as warehouse_code
             FROM inventory_levels il
             JOIN inventory_products p ON il.product_id=p.id
             JOIN inventory_warehouses w ON il.warehouse_id=w.id
             WHERE il.product_id=$1 AND p.agency_id=$2`,
            [id, aid(req)]
        ));
        return { success: true, data: rows };
    });

    fastify.get('/levels', auth, async (req) => {
        const rows = await safe(() => db.executeQuery(
            `SELECT il.*, p.name as product_name, p.sku as product_sku,
                    w.name as warehouse_name, w.code as warehouse_code
             FROM inventory_levels il
             JOIN inventory_products p ON il.product_id=p.id
             JOIN inventory_warehouses w ON il.warehouse_id=w.id
             WHERE p.agency_id=$1`,
            [aid(req)]
        ));
        return { success: true, data: rows };
    });

    // ─── Transactions ─────────────────────────────────────────────
    fastify.get('/transactions', auth, async (req) => {
        const q = req.query as any;
        let sql = `SELECT * FROM inventory_transactions WHERE agency_id=$1`;
        const params: any[] = [aid(req)];
        if (q.product_id)        { params.push(q.product_id);      sql += ` AND inventory_id IN (SELECT id FROM inventory_levels WHERE product_id=$${params.length})`; }
        if (q.transaction_type)  { params.push(q.transaction_type); sql += ` AND transaction_type=$${params.length}`; }
        sql += ` ORDER BY created_at DESC`;
        if (q.limit)             { params.push(parseInt(q.limit));  sql += ` LIMIT $${params.length}`; }
        const rows = await safe(() => db.executeQuery(sql, params));
        return { success: true, data: rows };
    });

    fastify.post('/transactions', auth, async (req, reply) => {
        const b = req.body as any;
        const rows = await safe(() => db.executeQuery(
            `INSERT INTO inventory_transactions
             (agency_id,inventory_id,transaction_type,quantity,unit_cost,total_cost,
              reference_type,reference_id,from_warehouse_id,to_warehouse_id,notes,created_by)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`,
            [aid(req), b.inventory_id, b.transaction_type, b.quantity, b.unit_cost, b.total_cost,
             b.reference_type, b.reference_id, b.from_warehouse_id, b.to_warehouse_id,
             b.notes, (req as any).user?.id]
        ));
        return reply.status(201).send({ success: true, data: rows[0] ?? null });
    });

    // ─── Adjustments ──────────────────────────────────────────────
    fastify.post('/adjustments', auth, async (req, reply) => {
        const b = req.body as any;
        // JOIN products to enforce agency_id — prevents adjusting another agency's inventory
        const rows = await safe(() => db.executeQuery(
            `INSERT INTO inventory_transactions
             (agency_id,inventory_id,transaction_type,quantity,unit_cost,notes,created_by)
             SELECT $1, il.id, 'ADJUSTMENT', $3, $4, $5, $6
             FROM inventory_levels il
             JOIN inventory_products p ON il.product_id=p.id
             WHERE il.product_id=$2 AND il.warehouse_id=$7 AND p.agency_id=$1
             RETURNING *`,
            [aid(req), b.product_id, b.quantity, b.unit_cost, b.notes,
             (req as any).user?.id, b.warehouse_id]
        ));
        return reply.status(201).send({ success: true, data: rows[0] ?? null });
    });

    // ─── Transfers ────────────────────────────────────────────────
    fastify.post('/transfers', auth, async (req, reply) => {
        const b = req.body as any;
        // JOIN products to enforce agency_id — prevents transferring another agency's stock
        const rows = await safe(() => db.executeQuery(
            `INSERT INTO inventory_transactions
             (agency_id,inventory_id,transaction_type,quantity,from_warehouse_id,to_warehouse_id,notes,created_by)
             SELECT $1, il.id, 'TRANSFER', $3, $4, $5, $6, $7
             FROM inventory_levels il
             JOIN inventory_products p ON il.product_id=p.id
             WHERE il.product_id=$2 AND il.warehouse_id=$4 AND p.agency_id=$1
             RETURNING *`,
            [aid(req), b.product_id, b.quantity, b.from_warehouse_id, b.to_warehouse_id,
             b.notes, (req as any).user?.id]
        ));
        return reply.status(201).send({ success: true, data: rows[0] ?? null });
    });

    // ─── Alerts ───────────────────────────────────────────────────
    fastify.get('/alerts/low-stock', auth, async (req) => {
        const rows = await safe(() => db.executeQuery(
            `SELECT il.*, p.name as product_name, p.sku as product_sku,
                    w.name as warehouse_name, w.code as warehouse_code
             FROM inventory_levels il
             JOIN inventory_products p ON il.product_id=p.id
             JOIN inventory_warehouses w ON il.warehouse_id=w.id
             WHERE p.agency_id=$1 AND il.quantity<=il.reorder_point
             ORDER BY il.quantity ASC`,
            [aid(req)]
        ));
        return { success: true, data: rows };
    });

    // ─── Serial Numbers ───────────────────────────────────────────
    fastify.get('/serial-numbers', auth, async (req) => {
        const q = req.query as any;
        let sql = `SELECT sn.*, p.name as product_name, p.sku as product_sku,
                          w.name as warehouse_name, w.code as warehouse_code
                   FROM inventory_serial_numbers sn
                   JOIN inventory_products p ON sn.product_id=p.id
                   LEFT JOIN inventory_warehouses w ON sn.warehouse_id=w.id
                   WHERE p.agency_id=$1`;
        const params: any[] = [aid(req)];
        if (q.product_id)  { params.push(q.product_id);   sql += ` AND sn.product_id=$${params.length}`; }
        if (q.warehouse_id){ params.push(q.warehouse_id); sql += ` AND sn.warehouse_id=$${params.length}`; }
        if (q.status)      { params.push(q.status);       sql += ` AND sn.status=$${params.length}`; }
        if (q.search)      { params.push(`%${q.search}%`);sql += ` AND sn.serial_number ILIKE $${params.length}`; }
        const rows = await safe(() => db.executeQuery(sql, params));
        return { success: true, data: rows };
    });

    fastify.post('/serial-numbers', auth, async (req, reply) => {
        const b = req.body as any;
        const rows = await safe(() => db.executeQuery(
            `INSERT INTO inventory_serial_numbers
             (agency_id,product_id,serial_number,warehouse_id,status,notes)
             VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
            [aid(req), b.product_id, b.serial_number, b.warehouse_id,
             b.status || 'available', b.notes]
        ));
        return reply.status(201).send({ success: true, data: rows[0] ?? null });
    });

    fastify.put('/serial-numbers/:id', auth, async (req) => {
        const { id } = req.params as any;
        const b = req.body as any;
        const rows = await safe(() => db.executeQuery(
            `UPDATE inventory_serial_numbers
             SET status=$2,warehouse_id=$3,notes=$4,updated_at=NOW()
             WHERE id=$1 AND agency_id=$5 RETURNING *`,
            [id, b.status, b.warehouse_id, b.notes, aid(req)]
        ));
        return { success: true, data: rows[0] ?? null };
    });

    fastify.delete('/serial-numbers/:id', auth, async (req) => {
        const { id } = req.params as any;
        await safe(() => db.executeQuery(
            `DELETE FROM inventory_serial_numbers WHERE id=$1 AND agency_id=$2`,
            [id, aid(req)]
        ));
        return { success: true };
    });

    // ─── Batches ──────────────────────────────────────────────────
    fastify.get('/batches', auth, async (req) => {
        const q = req.query as any;
        let sql = `SELECT b.*, p.name as product_name, p.sku as product_sku,
                          w.name as warehouse_name, w.code as warehouse_code
                   FROM inventory_batches b
                   JOIN inventory_products p ON b.product_id=p.id
                   LEFT JOIN inventory_warehouses w ON b.warehouse_id=w.id
                   WHERE p.agency_id=$1`;
        const params: any[] = [aid(req)];
        if (q.product_id) { params.push(q.product_id); sql += ` AND b.product_id=$${params.length}`; }
        if (q.status)     { params.push(q.status);     sql += ` AND b.status=$${params.length}`; }
        const rows = await safe(() => db.executeQuery(sql, params));
        return { success: true, data: rows };
    });

    fastify.post('/batches', auth, async (req, reply) => {
        const b = req.body as any;
        const rows = await safe(() => db.executeQuery(
            `INSERT INTO inventory_batches
             (agency_id,product_id,batch_number,warehouse_id,quantity,manufacture_date,expiry_date,cost_per_unit,status,notes)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
            [aid(req), b.product_id, b.batch_number, b.warehouse_id, b.quantity,
             b.manufacture_date, b.expiry_date, b.cost_per_unit, b.status || 'active', b.notes]
        ));
        return reply.status(201).send({ success: true, data: rows[0] ?? null });
    });

    fastify.put('/batches/:id', auth, async (req) => {
        const { id } = req.params as any;
        const b = req.body as any;
        const rows = await safe(() => db.executeQuery(
            `UPDATE inventory_batches
             SET quantity=$2,status=$3,notes=$4,expiry_date=$5,updated_at=NOW()
             WHERE id=$1 AND agency_id=$6 RETURNING *`,
            [id, b.quantity, b.status, b.notes, b.expiry_date, aid(req)]
        ));
        return { success: true, data: rows[0] ?? null };
    });

    fastify.delete('/batches/:id', auth, async (req) => {
        const { id } = req.params as any;
        await safe(() => db.executeQuery(
            `DELETE FROM inventory_batches WHERE id=$1 AND agency_id=$2`,
            [id, aid(req)]
        ));
        return { success: true };
    });

    // ─── BOMs ─────────────────────────────────────────────────────
    fastify.get('/boms', auth, async (req) => {
        const q = req.query as any;
        let sql = `SELECT b.*, p.name as product_name, p.sku as product_sku,
                   (SELECT COUNT(*) FROM inventory_bom_items bi WHERE bi.bom_id=b.id) as item_count
                   FROM inventory_boms b
                   JOIN inventory_products p ON b.product_id=p.id
                   WHERE b.agency_id=$1`;
        const params: any[] = [aid(req)];
        if (q.product_id)        { params.push(q.product_id);          sql += ` AND b.product_id=$${params.length}`; }
        if (q.is_active !== undefined) { params.push(q.is_active === 'true'); sql += ` AND b.is_active=$${params.length}`; }
        sql += ` ORDER BY b.name`;
        const rows = await safe(() => db.executeQuery(sql, params));
        return { success: true, data: rows };
    });

    fastify.get('/boms/:id', auth, async (req) => {
        const { id } = req.params as any;
        const [boms, items] = await Promise.all([
            safe(() => db.executeQuery(
                `SELECT b.*, p.name as product_name, p.sku as product_sku
                 FROM inventory_boms b
                 JOIN inventory_products p ON b.product_id=p.id
                 WHERE b.id=$1 AND b.agency_id=$2`,
                [id, aid(req)]
            )),
            safe(() => db.executeQuery(
                `SELECT bi.*, p.name as component_name, p.sku as component_sku, p.unit_of_measure as component_uom
                 FROM inventory_bom_items bi
                 JOIN inventory_boms b ON bi.bom_id=b.id
                 JOIN inventory_products p ON bi.component_product_id=p.id
                 WHERE bi.bom_id=$1 AND b.agency_id=$2
                 ORDER BY bi.sequence`,
                [id, aid(req)]
            )),
        ]);
        const bom = boms[0] ?? null;
        if (bom) bom.items = items;
        return { success: true, data: bom };
    });

    fastify.post('/boms', auth, async (req, reply) => {
        const b = req.body as any;
        const rows = await safe(() => db.executeQuery(
            `INSERT INTO inventory_boms (agency_id,product_id,name,version,is_active,notes)
             VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
            [aid(req), b.product_id, b.name, b.version, b.is_active ?? true, b.notes]
        ));
        return reply.status(201).send({ success: true, data: rows[0] ?? null });
    });

    fastify.put('/boms/:id', auth, async (req) => {
        const { id } = req.params as any;
        const b = req.body as any;
        const rows = await safe(() => db.executeQuery(
            `UPDATE inventory_boms
             SET name=$2,version=$3,is_active=$4,notes=$5,updated_at=NOW()
             WHERE id=$1 AND agency_id=$6 RETURNING *`,
            [id, b.name, b.version, b.is_active, b.notes, aid(req)]
        ));
        return { success: true, data: rows[0] ?? null };
    });

    fastify.delete('/boms/:id', auth, async (req) => {
        const { id } = req.params as any;
        await safe(() => db.executeQuery(
            `DELETE FROM inventory_boms WHERE id=$1 AND agency_id=$2`,
            [id, aid(req)]
        ));
        return { success: true };
    });

    // ─── Reports ──────────────────────────────────────────────────
    fastify.get('/reports', auth, async (req) => {
        const [summary, transactions] = await Promise.all([
            safe(() => db.executeQuery(
                `SELECT
                   (SELECT COUNT(*) FROM inventory_products WHERE agency_id=$1 AND is_active=true)::int as total_products,
                   (SELECT COUNT(*) FROM inventory_warehouses WHERE agency_id=$1 AND is_active=true)::int as total_warehouses,
                   (SELECT COUNT(*) FROM inventory_levels il JOIN inventory_products p ON il.product_id=p.id WHERE p.agency_id=$1)::int as total_inventory_records,
                   (SELECT COALESCE(SUM(quantity),0) FROM inventory_levels il JOIN inventory_products p ON il.product_id=p.id WHERE p.agency_id=$1)::numeric as total_quantity,
                   (SELECT COUNT(*) FROM inventory_levels il JOIN inventory_products p ON il.product_id=p.id WHERE p.agency_id=$1 AND il.quantity<=il.reorder_point)::int as low_stock_items`,
                [aid(req)]
            )),
            safe(() => db.executeQuery(
                `SELECT transaction_type,
                        COUNT(*)::int as count,
                        COALESCE(SUM(quantity),0)::numeric as total_quantity,
                        COALESCE(SUM(total_cost),0)::numeric as total_cost
                 FROM inventory_transactions WHERE agency_id=$1 GROUP BY transaction_type`,
                [aid(req)]
            )),
        ]);
        return { success: true, data: { summary: summary[0] ?? {}, transactions, top_products: [], warehouses: [], date_range: { from: '', to: '' } } };
    });

    fastify.get('/reports/stock-value', auth, async (req) => {
        const rows = await safe(() => db.executeQuery(
            `SELECT p.id, p.sku, p.name, p.category_id,
                    w.id as warehouse_id, w.code as warehouse_code, w.name as warehouse_name,
                    il.quantity, il.available_quantity, il.average_cost, il.last_cost,
                    (il.quantity * il.average_cost)::numeric as stock_value, il.reorder_point,
                    (il.quantity <= il.reorder_point) as is_low_stock
             FROM inventory_levels il
             JOIN inventory_products p ON il.product_id=p.id
             JOIN inventory_warehouses w ON il.warehouse_id=w.id
             WHERE p.agency_id=$1 ORDER BY stock_value DESC`,
            [aid(req)]
        ));
        return { success: true, data: rows };
    });

    fastify.get('/reports/movement', auth, async (req) => {
        const rows = await safe(() => db.executeQuery(
            `SELECT DATE(t.created_at) as date, t.transaction_type,
                    COUNT(*)::int as transaction_count,
                    SUM(t.quantity)::numeric as total_quantity,
                    COALESCE(SUM(t.total_cost),0)::numeric as total_cost
             FROM inventory_transactions t
             WHERE t.agency_id=$1
             GROUP BY DATE(t.created_at), t.transaction_type ORDER BY date DESC`,
            [aid(req)]
        ));
        return { success: true, data: rows };
    });

    fastify.get('/reports/warehouse-utilization', auth, async (req) => {
        const rows = await safe(() => db.executeQuery(
            `SELECT w.id, w.code, w.name,
                    COUNT(DISTINCT il.product_id)::int as product_count,
                    COUNT(il.id)::int as inventory_records,
                    COALESCE(SUM(il.quantity),0)::numeric as total_quantity,
                    COALESCE(SUM(il.available_quantity),0)::numeric as available_quantity,
                    COALESCE(SUM(il.reserved_quantity),0)::numeric as reserved_quantity,
                    COALESCE(SUM(il.quantity * il.average_cost),0)::numeric as total_value,
                    COUNT(CASE WHEN il.quantity<=il.reorder_point THEN 1 END)::int as low_stock_count
             FROM inventory_warehouses w
             LEFT JOIN inventory_levels il ON il.warehouse_id=w.id
             WHERE w.agency_id=$1
             GROUP BY w.id, w.code, w.name ORDER BY w.name`,
            [aid(req)]
        ));
        return { success: true, data: rows };
    });
};

export default inventoryRoutes;
