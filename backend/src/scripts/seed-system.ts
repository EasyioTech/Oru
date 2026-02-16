
import { db } from '../infrastructure/database/index.js';
import { pageCatalog, subscriptionPlans, systemSettings, systemFeatures } from '../infrastructure/database/schema.js';
import { sql, eq } from 'drizzle-orm';

const ERP_PAGES = [
    // Dashboard
    { path: '/dashboard', title: 'Main Dashboard', category: 'dashboard', icon: 'LayoutDashboard', displayOrder: 1 },
    { path: '/analytics', title: 'System Analytics', category: 'dashboard', icon: 'BarChart3', displayOrder: 2 },

    // CRM
    { path: '/crm/leads', title: 'Leads Management', category: 'management', icon: 'UserPlus', displayOrder: 10 },
    { path: '/crm/customers', title: 'Customer Directory', category: 'management', icon: 'Users', displayOrder: 11 },
    { path: '/crm/pipeline', title: 'Sales Pipeline', category: 'management', icon: 'GitMerge', displayOrder: 12 },

    // HRM
    { path: '/hrm/employees', title: 'Employee Management', category: 'hr', icon: 'Contact', displayOrder: 20 },
    { path: '/hrm/payroll', title: 'Payroll Processing', category: 'hr', icon: 'Banknote', displayOrder: 21 },
    { path: '/hrm/leave', title: 'Leave Management', category: 'hr', icon: 'CalendarOff', displayOrder: 22 },
    { path: '/hrm/attendance', title: 'Attendance Tracking', category: 'hr', icon: 'Clock', displayOrder: 23 },

    // Finance
    { path: '/finance/ledger', title: 'General Ledger', category: 'finance', icon: 'Book', displayOrder: 30 },
    { path: '/finance/invoices', title: 'Invoicing', category: 'finance', icon: 'FileCheck', displayOrder: 31 },
    { path: '/finance/expenses', title: 'Expense Tracking', category: 'finance', icon: 'Receipt', displayOrder: 32 },
    { path: '/finance/tax', title: 'Tax Management', category: 'finance', icon: 'Calculator', displayOrder: 33 },

    // Project Management
    { path: '/projects/active', title: 'Active Projects', category: 'projects', icon: 'FolderKanban', displayOrder: 40 },
    { path: '/projects/tasks', title: 'Task Board', category: 'projects', icon: 'CheckSquare', displayOrder: 41 },
    { path: '/projects/timesheets', title: 'Timesheets', category: 'projects', icon: 'Timer', displayOrder: 42 },

    // Inventory
    { path: '/inventory/stock', title: 'Stock Management', category: 'inventory', icon: 'PackageSearch', displayOrder: 50 },
    { path: '/inventory/products', title: 'Product Catalog', category: 'inventory', icon: 'Boxes', displayOrder: 51 },
    { path: '/inventory/warehouses', title: 'Warehouse Management', category: 'inventory', icon: 'Warehouse', displayOrder: 52 },

    // Procurement
    { path: '/procurement/orders', title: 'Purchase Orders', category: 'procurement', icon: 'ShoppingCart', displayOrder: 60 },
    { path: '/procurement/suppliers', title: 'Supplier Directory', category: 'procurement', icon: 'Truck', displayOrder: 61 },

    // Assets
    { path: '/assets/list', title: 'Asset Registry', category: 'assets', icon: 'HardDrive', displayOrder: 70 },
    { path: '/assets/maintenance', title: 'Maintenance Schedule', category: 'assets', icon: 'Wrench', displayOrder: 71 },

    // Automation & Workflows
    { path: '/automation/flows', title: 'Automation Flows', category: 'automation', icon: 'Zap', displayOrder: 80 },
    { path: '/automation/webhooks', title: 'Webhooks', category: 'automation', icon: 'Webhook', displayOrder: 81 },

    // System
    { path: '/system/users', title: 'System Users', category: 'system', icon: 'ShieldCheck', displayOrder: 90 },
    { path: '/system/audit', title: 'Audit Logs', category: 'system', icon: 'FileSearch', displayOrder: 91 },
    { path: '/system/settings', title: 'Platform Settings', category: 'system', icon: 'Settings', displayOrder: 92 },

    // Additional Pages to reach 50+
    { path: '/hrm/recruitment', title: 'Job Openings', category: 'hr', icon: 'Briefcase', displayOrder: 24 },
    { path: '/hrm/interviews', title: 'Interviews', category: 'hr', icon: 'Video', displayOrder: 25 },
    { path: '/finance/assets', title: 'Fixed Assets', category: 'finance', icon: 'TrendingUp', displayOrder: 34 },
    { path: '/finance/budget', title: 'Budgets', category: 'finance', icon: 'PieChart', displayOrder: 35 },
    { path: '/projects/backlog', title: 'Product Backlog', category: 'projects', icon: 'ListTodo', displayOrder: 43 },
    { path: '/projects/sprints', title: 'Sprint Planning', category: 'projects', icon: 'IterationCcw', displayOrder: 44 },
    { path: '/inventory/categories', title: 'Categories', category: 'inventory', icon: 'Tags', displayOrder: 53 },
    { path: '/inventory/transfers', title: 'Stock Transfers', category: 'inventory', icon: 'ArrowRightLeft', displayOrder: 54 },
    { path: '/procurement/contracts', title: 'Vendor Contracts', category: 'procurement', icon: 'FileSignature', displayOrder: 62 },
    { path: '/procurement/rfq', title: 'RFQs', category: 'procurement', icon: 'MessageSquare', displayOrder: 63 },
    { path: '/compliance/audit', title: 'Compliance Audit', category: 'compliance', icon: 'CheckCircle2', displayOrder: 100 },
    { path: '/compliance/policy', title: 'Policy Manager', category: 'compliance', icon: 'Shield', displayOrder: 101 },
    { path: '/analytics/sales', title: 'Sales Analytics', category: 'analytics', icon: 'LineChart', displayOrder: 110 },
    { path: '/analytics/ops', title: 'Ops Analytics', category: 'analytics', icon: 'Activity', displayOrder: 111 },
    { path: '/personal/tasks', title: 'My Tasks', category: 'personal', icon: 'CheckCircle', displayOrder: 120 },
    { path: '/personal/calendar', title: 'Personal Calendar', category: 'personal', icon: 'CalendarDays', displayOrder: 121 },
    { path: '/automation/logs', title: 'Workflow Logs', category: 'automation', icon: 'History', displayOrder: 82 },
    { path: '/automation/triggers', title: 'Custom Triggers', category: 'automation', icon: 'ZapOff', displayOrder: 83 },
    { path: '/management/teams', title: 'Team Directory', category: 'management', icon: 'Network', displayOrder: 130 },
    { path: '/management/roles', title: 'Role Permissions', category: 'management', icon: 'Lock', displayOrder: 131 },
    { path: '/reports/export', title: 'Data Exports', category: 'reports', icon: 'Download', displayOrder: 140 },
    { path: '/reports/schedule', title: 'Scheduled Reports', category: 'reports', icon: 'Timer', displayOrder: 141 },
    { path: '/system/maintenance', title: 'Maintenance Window', category: 'system', icon: 'Hammer', displayOrder: 93 },
    { path: '/system/api-logs', title: 'API Access Logs', category: 'system', icon: 'ListJson', displayOrder: 94 },
];

const SUBSCRIPTION_PLANS = [
    { name: 'Starter', code: 'starter', basePriceMonthly: 49.00, maxUsers: 5, features: [] },
    { name: 'Professional', code: 'professional', basePriceMonthly: 149.00, maxUsers: 25, features: [] },
    { name: 'Enterprise', code: 'enterprise', basePriceMonthly: 499.00, maxUsers: 1000, features: [] },
];

const SYSTEM_FEATURES = [
    { name: 'Multi-Agency Management', key: 'multi_agency', description: 'Enable managing multiple agencies from a single account' },
    { name: 'Advanced Analytics', key: 'advanced_analytics', description: 'Detailed charts and business intelligence reports' },
    { name: 'Custom Branding', key: 'custom_branding', description: 'Ability to change logo and theme colors' },
    { name: 'API Access', key: 'api_access', description: 'Access to system APIs for integrations' },
    { name: 'Priority Support', key: 'priority_support', description: 'Fast-track support tickets' },
    { name: 'Unlimited Storage', key: 'unlimited_storage', description: 'No limit on file uploads and database size' },
];

async function seed() {
    try {
        console.log('Seeding system data...');

        // 1. Seed System Settings if not exists
        const [settings] = await db.select().from(systemSettings).limit(1);
        if (!settings) {
            await db.insert(systemSettings).values({
                systemName: 'BuildFlow ERP',
                maintenanceMode: false,
                enableRegistration: true,
            });
            console.log('Seeded system settings.');
        }

        // 2. Seed System Features
        const seededFeatures: any[] = [];
        for (const f of SYSTEM_FEATURES) {
            const [feature] = await db.insert(systemFeatures).values({
                name: f.name,
                featureKey: f.key,
                description: f.description,
                isActive: true,
            }).onConflictDoNothing().returning();

            if (feature) {
                seededFeatures.push(feature);
            } else {
                const [existing] = await db.select().from(systemFeatures).where(eq(systemFeatures.featureKey, f.key));
                seededFeatures.push(existing);
            }
        }
        console.log('Seeded system features.');

        // 3. Seed Subscription Plans
        for (const planData of SUBSCRIPTION_PLANS) {
            // Assign some features to Professional and Enterprise
            let planFeatures: any[] = [];
            if (planData.code === 'professional') {
                planFeatures = seededFeatures.slice(0, 3).map(f => ({ ...f, enabled: true }));
            } else if (planData.code === 'enterprise') {
                planFeatures = seededFeatures.map(f => ({ ...f, enabled: true }));
            }

            await db.insert(subscriptionPlans).values({
                name: planData.name,
                slug: planData.code,
                description: `${planData.name} Plan for growing agencies`,
                basePriceMonthly: planData.basePriceMonthly.toString(),
                maxUsers: planData.maxUsers,
                features: planFeatures,
                isActive: true,
            }).onConflictDoNothing();
        }
        console.log('Seeded subscription plans.');

        // 4. Seed Page Catalog
        for (const page of ERP_PAGES) {
            await db.insert(pageCatalog).values({
                path: page.path,
                title: page.title,
                category: page.category as any,
                icon: page.icon,
                displayOrder: page.displayOrder,
                isActive: true,
                baseCost: '0.00',
            }).onConflictDoNothing();
        }
        console.log(`Seeded ${ERP_PAGES.length} pages into catalog.`);

        console.log('Seeding completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
}

seed();
