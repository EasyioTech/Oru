-- Inventory module tables

CREATE TABLE IF NOT EXISTS inventory_warehouses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id UUID NOT NULL,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  address TEXT,
  city TEXT,
  state TEXT,
  postal_code TEXT,
  country TEXT,
  contact_person TEXT,
  phone TEXT,
  email TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS inventory_product_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  parent_id UUID REFERENCES inventory_product_categories(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS inventory_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id UUID NOT NULL,
  sku TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category_id UUID REFERENCES inventory_product_categories(id),
  brand TEXT,
  unit_of_measure TEXT NOT NULL DEFAULT 'EA',
  barcode TEXT,
  qr_code TEXT,
  weight NUMERIC,
  dimensions JSONB,
  image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_trackable BOOLEAN NOT NULL DEFAULT false,
  track_by TEXT NOT NULL DEFAULT 'none',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS inventory_levels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES inventory_products(id),
  warehouse_id UUID NOT NULL REFERENCES inventory_warehouses(id),
  quantity NUMERIC NOT NULL DEFAULT 0,
  available_quantity NUMERIC NOT NULL DEFAULT 0,
  reserved_quantity NUMERIC NOT NULL DEFAULT 0,
  average_cost NUMERIC NOT NULL DEFAULT 0,
  last_cost NUMERIC,
  reorder_point NUMERIC NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (product_id, warehouse_id)
);

CREATE TABLE IF NOT EXISTS inventory_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id UUID NOT NULL,
  inventory_id UUID NOT NULL REFERENCES inventory_levels(id),
  transaction_type TEXT NOT NULL,
  quantity NUMERIC NOT NULL,
  unit_cost NUMERIC,
  total_cost NUMERIC,
  reference_type TEXT,
  reference_id UUID,
  from_warehouse_id UUID REFERENCES inventory_warehouses(id),
  to_warehouse_id UUID REFERENCES inventory_warehouses(id),
  notes TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS inventory_serial_numbers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id UUID NOT NULL,
  product_id UUID NOT NULL REFERENCES inventory_products(id),
  serial_number TEXT NOT NULL,
  warehouse_id UUID REFERENCES inventory_warehouses(id),
  status TEXT NOT NULL DEFAULT 'available',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS inventory_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id UUID NOT NULL,
  product_id UUID NOT NULL REFERENCES inventory_products(id),
  batch_number TEXT NOT NULL,
  warehouse_id UUID REFERENCES inventory_warehouses(id),
  quantity NUMERIC NOT NULL,
  manufacture_date TIMESTAMPTZ,
  expiry_date TIMESTAMPTZ,
  cost_per_unit NUMERIC,
  status TEXT NOT NULL DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS inventory_boms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id UUID NOT NULL,
  product_id UUID NOT NULL REFERENCES inventory_products(id),
  name TEXT NOT NULL,
  version TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS inventory_bom_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bom_id UUID NOT NULL REFERENCES inventory_boms(id) ON DELETE CASCADE,
  component_product_id UUID NOT NULL REFERENCES inventory_products(id),
  quantity NUMERIC NOT NULL,
  unit_of_measure TEXT,
  sequence INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inv_products_agency ON inventory_products(agency_id);
CREATE INDEX IF NOT EXISTS idx_inv_levels_product ON inventory_levels(product_id);
CREATE INDEX IF NOT EXISTS idx_inv_levels_warehouse ON inventory_levels(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_inv_transactions_agency ON inventory_transactions(agency_id);
CREATE INDEX IF NOT EXISTS idx_inv_serial_agency ON inventory_serial_numbers(agency_id);
CREATE INDEX IF NOT EXISTS idx_inv_batches_agency ON inventory_batches(agency_id);
