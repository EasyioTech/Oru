# ERP Database Schema

## Overview
Comprehensive multi-tenant ERP database with 20+ tables covering all business operations.

## Architecture
- **Control Plane**: Main `oru` database (agencies, users, provisioning)
- **Agency Databases**: Separate database per agency (all business data)

## Modules

### 1. Core (Control Plane)
- `agencies` - Tenant management
- `users` - User accounts with 2FA
- `agency_provisioning_jobs` - Async agency creation

### 2. HR Module
- `employees` - Employee master data
- `departments` - Organizational structure
- `attendance` - Daily attendance tracking
- `leaves` - Leave management

### 3. CRM Module
- `customers` - Customer master with GST/PAN
- `leads` - Lead pipeline management

### 4. Inventory Module
- `products` - Product catalog with SKU
- `stock_movements` - Stock transaction history

### 5. Financial Module
- `invoices` + `invoice_items` - Billing
- `payments` - Payment tracking
- `expenses` - Expense management

### 6. Projects Module
- `projects` - Project management
- `tasks` - Task tracking with time

### 7. Audit
- `audit_logs` - Complete audit trail

## Key Features
- ✅ UUID primary keys (auto-generated)
- ✅ Soft deletes where needed
- ✅ Timestamps (created_at, updated_at)
- ✅ JSONB for flexible data
- ✅ Decimal for financial precision
- ✅ Enums for type safety
- ✅ Indexes on foreign keys
- ✅ Cascade deletes

## Tables Count
- Control Plane: 3 tables
- Agency Database: 17 tables
- **Total: 20 tables**

## Next Steps
1. Push schema to database
2. Create seed data
3. Build API routes for each module
