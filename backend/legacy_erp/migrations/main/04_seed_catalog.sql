INSERT INTO public.page_catalog (path, title, description, icon, category, base_cost, display_order, is_active, requires_approval, has_trial, trial_duration_days) VALUES
('/dashboard', 'Main Dashboard', 'Main dashboard for all users', 'BarChart3', 'dashboard', 0, 1, true, false, false, NULL),
('/system', 'System Dashboard', 'System administration dashboard', 'Server', 'system', 0, 1, true, true, false, NULL),
('/system-health', 'System Health', 'System health monitoring', 'Activity', 'system', 0, 2, true, true, false, NULL),
('/agency', 'Agency Dashboard', 'Agency dashboard', 'Building2', 'dashboard', 0, 2, true, false, false, NULL),
('/employee-management', 'Employee Management', 'Employee management and administration', 'Users', 'management', 0, 1, true, false, false, NULL),
('/create-employee', 'Create Employee', 'Create new employee', 'UserPlus', 'management', 0, 2, true, false, false, NULL),
('/assign-user-roles', 'Assign User Roles', 'Assign roles to users', 'UserCog', 'management', 0, 3, true, false, false, NULL),
('/employee-performance', 'Employee Performance', 'Employee performance tracking', 'TrendingUp', 'hr', 0, 1, true, false, false, NULL),
('/project-management', 'Project Management', 'Project management interface', 'FolderKanban', 'projects', 0, 1, true, false, false, NULL),
('/projects', 'Projects', 'Projects overview', 'Briefcase', 'projects', 0, 2, true, false, false, NULL),
('/my-projects', 'My Projects', 'Employee view of assigned projects', 'Briefcase', 'personal', 0, 1, true, false, false, NULL),
('/settings', 'Settings', 'User settings', 'Settings', 'settings', 0, 1, true, false, false, NULL),
('/agency-setup', 'Agency Setup', 'Agency configuration and setup', 'Building2', 'settings', 0, 2, true, false, false, NULL),
('/agency-setup-progress', 'Agency Setup Progress', 'Agency setup progress tracking', 'Progress', 'settings', 0, 3, true, false, false, NULL),
('/attendance', 'Attendance', 'Attendance management', 'Clock', 'hr', 0, 2, true, false, false, NULL),
('/leave-requests', 'Leave Requests', 'Leave request management', 'ClipboardList', 'hr', 0, 3, true, false, false, NULL),
('/holiday-management', 'Holiday Management', 'Holiday calendar management', 'CalendarDays', 'hr', 0, 4, true, false, false, NULL),
('/role-requests', 'Role Requests', 'Role change requests', 'UserCog', 'hr', 0, 5, true, false, false, NULL),
('/calendar', 'Calendar', 'Calendar view', 'Calendar', 'hr', 0, 6, true, false, false, NULL),
('/payroll', 'Payroll', 'Payroll management', 'DollarSign', 'finance', 0, 1, true, false, false, NULL),
('/invoices', 'Invoices', 'Invoice management', 'FileText', 'finance', 0, 2, true, false, false, NULL),
('/payments', 'Payments', 'Payment tracking', 'CreditCard', 'finance', 0, 3, true, false, false, NULL),
('/receipts', 'Receipts', 'Receipt management', 'Receipt', 'finance', 0, 4, true, false, false, NULL),
('/ledger', 'Ledger', 'General ledger', 'BookOpen', 'finance', 0, 5, true, false, false, NULL),
('/financial-management', 'Financial Management', 'Financial management dashboard', 'Calculator', 'finance', 0, 6, true, false, false, NULL),
('/gst-compliance', 'GST Compliance', 'GST compliance management', 'FileBarChart', 'compliance', 0, 1, true, false, false, NULL),
('/quotations', 'Quotations', 'Quotation management', 'FileCheck', 'finance', 0, 7, true, false, false, NULL),
('/reimbursements', 'Reimbursements', 'Reimbursement requests', 'DollarSign', 'finance', 0, 8, true, false, false, NULL),
('/jobs', 'Job Costing', 'Job costing', 'Target', 'projects', 0, 3, true, false, false, NULL),
('/my-profile', 'My Profile', 'User profile', 'User', 'personal', 0, 2, true, false, false, NULL),
('/my-attendance', 'My Attendance', 'Personal attendance view', 'Clock', 'personal', 0, 3, true, false, false, NULL),
('/my-leave', 'My Leave', 'Personal leave management', 'Calendar', 'personal', 0, 4, true, false, false, NULL),
('/clients', 'Clients', 'Client management', 'Handshake', 'management', 0, 4, true, false, false, NULL),
('/crm', 'CRM', 'CRM system', 'Users2', 'management', 0, 5, true, false, true, 30),
('/reports', 'Reports', 'Reports dashboard', 'ChartLine', 'reports', 0, 1, true, false, false, NULL),
('/analytics', 'Analytics', 'Analytics dashboard', 'ChartLine', 'analytics', 0, 1, true, false, true, 14),
('/centralized-reports', 'Centralized Reports', 'Centralized reporting', 'FileBarChart', 'reports', 0, 2, true, false, false, NULL),
('/advanced-dashboard', 'Advanced Dashboard', 'Advanced analytics dashboard', 'TrendingUp', 'analytics', 0, 2, true, false, true, 14),
('/department-management', 'Department Management', 'Department management', 'Building2', 'management', 0, 6, true, false, false, NULL),
('/ai-features', 'AI Features', 'AI-powered features', 'Sparkles', 'automation', 0, 1, true, false, true, 7),
('/email-testing', 'Email Testing', 'Email service testing', 'Mail', 'system', 0, 3, true, true, false, NULL),
('/permissions', 'Permissions', 'Advanced permissions management', 'Shield', 'system', 0, 4, true, false, false, NULL),
('/documents', 'Documents', 'Document management', 'FileText', 'management', 0, 7, true, false, false, NULL),
('/notifications', 'Notifications', 'Notifications', 'Bell', 'personal', 0, 5, true, false, false, NULL),
('/inventory/products', 'Product Catalog', 'Product catalog management', 'Boxes', 'inventory', 0, 1, true, false, true, 30),
('/inventory/bom', 'Bill of Materials', 'Bill of Materials management', 'Layers', 'inventory', 0, 2, true, false, false, NULL),
('/inventory/serial-batch', 'Serial & Batch Tracking', 'Serial and batch tracking', 'Hash', 'inventory', 0, 3, true, false, false, NULL),
('/inventory/warehouses', 'Warehouses', 'Warehouse management', 'Warehouse', 'inventory', 0, 4, true, false, false, NULL),
('/inventory/stock-levels', 'Stock Levels', 'Stock levels tracking', 'TrendingUp', 'inventory', 0, 5, true, false, false, NULL),
('/inventory/transfers', 'Transfers', 'Inter-warehouse transfers', 'ArrowRightLeft', 'inventory', 0, 6, true, false, false, NULL),
('/inventory/adjustments', 'Adjustments', 'Inventory adjustments', 'Edit', 'inventory', 0, 7, true, false, false, NULL),
('/procurement/vendors', 'Vendors', 'Vendor management', 'Handshake', 'procurement', 0, 1, true, false, false, NULL),
('/procurement/purchase-orders', 'Purchase Orders', 'Purchase order management', 'ShoppingBag', 'procurement', 0, 2, true, false, false, NULL),
('/procurement/requisitions', 'Requisitions', 'Purchase requisitions', 'FileText', 'procurement', 0, 3, true, false, false, NULL),
('/procurement/goods-receipts', 'Goods Receipts', 'Goods receipt management', 'PackageCheck', 'procurement', 0, 4, true, false, false, NULL),
('/procurement/rfq', 'RFQ/RFP', 'RFQ/RFP management', 'FileSearch', 'procurement', 0, 5, true, false, false, NULL),
('/assets', 'Assets', 'Asset management', 'Building2', 'assets', 0, 1, true, false, true, 30),
('/assets/categories', 'Asset Categories', 'Asset category management', 'FolderTree', 'assets', 0, 2, true, false, false, NULL),
('/assets/maintenance', 'Asset Maintenance', 'Maintenance tracking', 'Wrench', 'assets', 0, 3, true, false, false, NULL),
('/assets/depreciation', 'Asset Depreciation', 'Depreciation tracking', 'TrendingDown', 'assets', 0, 4, true, false, false, NULL),
('/workflows', 'Workflows', 'Workflow management', 'Workflow', 'workflows', 0, 1, true, false, true, 14),
('/workflows/builder', 'Workflow Builder', 'Visual workflow builder', 'GitBranch', 'workflows', 0, 2, true, false, false, NULL),
('/workflows/approvals', 'Approval Queue', 'Workflow approval queue', 'CheckCircle2', 'workflows', 0, 3, true, false, false, NULL),
('/integrations', 'Integrations', 'Integration hub', 'Plug', 'automation', 0, 2, true, false, true, 14)
ON CONFLICT (path) DO NOTHING;

WITH page_ids AS (
    SELECT id, path FROM public.page_catalog
)
INSERT INTO public.page_recommendation_rules (page_id, industry, company_size, business_goals, priority, is_required, weight)
SELECT id, ARRAY['construction', 'architecture', 'engineering']::TEXT[], NULL::TEXT[], ARRAY['project_tracking']::TEXT[], 8, true, 1.5
FROM page_ids WHERE path IN ('/projects', '/project-management')
UNION ALL
SELECT id, NULL::TEXT[], NULL::TEXT[], ARRAY['financial_planning']::TEXT[], 9, true, 2.0
FROM page_ids WHERE path IN ('/invoices', '/payments', '/financial-management')
UNION ALL
SELECT id, NULL::TEXT[], ARRAY['11-50', '51-200', '201-500', '500+']::TEXT[], ARRAY['hr_management']::TEXT[], 7, false, 1.2
FROM page_ids WHERE path IN ('/attendance', '/leave-requests', '/employee-management')
UNION ALL
SELECT id, ARRAY['manufacturing', 'retail']::TEXT[], NULL::TEXT[], ARRAY['inventory_control']::TEXT[], 9, true, 1.8
FROM page_ids WHERE path LIKE '/inventory%'
UNION ALL
SELECT id, ARRAY['manufacturing', 'construction']::TEXT[], NULL::TEXT[], ARRAY['procurement']::TEXT[], 7, false, 1.3
FROM page_ids WHERE path LIKE '/procurement%'
UNION ALL
SELECT id, NULL::TEXT[], ARRAY['51-200', '201-500', '500+']::TEXT[], ARRAY['asset_tracking']::TEXT[], 6, false, 1.0
FROM page_ids WHERE path LIKE '/assets%'
UNION ALL
SELECT id, NULL::TEXT[], NULL::TEXT[], ARRAY['client_management']::TEXT[], 8, false, 1.4
FROM page_ids WHERE path IN ('/crm', '/clients')
UNION ALL
SELECT id, NULL::TEXT[], ARRAY['51-200', '201-500', '500+']::TEXT[], ARRAY['workflow_automation']::TEXT[], 7, false, 1.2
FROM page_ids WHERE path LIKE '/workflows%'
UNION ALL
SELECT id, NULL::TEXT[], NULL::TEXT[], ARRAY['analytics_insights', 'compliance_reporting']::TEXT[], 6, false, 1.0
FROM page_ids WHERE path IN ('/reports', '/analytics', '/advanced-dashboard')
ON CONFLICT (page_id) DO NOTHING;

INSERT INTO public.agency_page_assignments (agency_id, page_id, status)
SELECT a.id, pc.id, 'active'::page_assignment_status
FROM public.agencies a
CROSS JOIN public.page_catalog pc
WHERE pc.is_active = true AND pc.deleted_at IS NULL
ON CONFLICT (agency_id, page_id) DO NOTHING;
