import { FastifyInstance } from 'fastify';

export default async function seoRoutes(fastify: FastifyInstance) {
  // Meta tags for industry pages
  const industryPages: Record<string, { title: string; description: string; keywords: string }> = {
    'marketing-agencies': {
      title: 'Best ERP for Marketing & Advertising Agencies | Oru ERP',
      description: 'Ranked #1 ERP for marketing agencies. Manage campaigns, creative resources, and agency profitability with Oru ERP.',
      keywords: 'marketing agency erp, ad agency software, creative agency management, agency profitability tool'
    },
    'software-development': {
      title: 'ERP for Software Development Teams | Oru ERP',
      description: 'Purpose-built ERP for software agencies. Project tracking, resource allocation, and client billing.',
      keywords: 'software development erp, dev team management, technical project management, billing software'
    },
    'creative-agencies': {
      title: 'Creative Agency Management Software | Oru ERP',
      description: 'ERP designed for creative agencies. Design projects, creative workflows, and team collaboration.',
      keywords: 'creative agency erp, design project management, creative team software, design billing'
    },
    'consulting-firms': {
      title: 'Consulting Firm ERP & Project Management | Oru ERP',
      description: 'ERP for consulting firms. Billable hours, project profitability, and client engagement tracking.',
      keywords: 'consulting erp, billable hours tracking, professional services automation, consulting software'
    },
    'digital-marketing': {
      title: 'Digital Marketing Agency Software | Oru ERP',
      description: 'ERP for digital marketing agencies. Campaign management, client tracking, and ROI reporting.',
      keywords: 'digital marketing erp, marketing agency software, campaign management, marketing automation'
    },
    'advertising': {
      title: 'Advertising Agency Management Platform | Oru ERP',
      description: 'Complete ERP for advertising agencies. Creative workflows, media buys, and client collaboration.',
      keywords: 'advertising agency software, ad agency erp, media buying platform, advertising management'
    },
    'media-production': {
      title: 'Media Production Company ERP | Oru ERP',
      description: 'ERP for media production. Project tracking, resource scheduling, and production workflows.',
      keywords: 'media production software, video production erp, production management, broadcast management'
    },
    'architecture-design': {
      title: 'Architecture & Design Firm Software | Oru ERP',
      description: 'ERP for architecture and design firms. Project management, blueprints, and client communication.',
      keywords: 'architecture firm software, design firm erp, architectural project management, cad management'
    },
    'legal-services': {
      title: 'Legal Practice Management Software | Oru ERP',
      description: 'ERP for law firms. Time tracking, case management, and billable hours automation.',
      keywords: 'legal practice management, law firm software, time tracking, case management, legal billing'
    },
    'accounting-firms': {
      title: 'Accounting Firm Software & ERP | Oru ERP',
      description: 'ERP for accounting firms. Client management, engagement tracking, and financial reporting.',
      keywords: 'accounting firm software, cpa firm management, accounting erp, tax firm software'
    },
    'it-services': {
      title: 'IT Services & MSP Management Software | Oru ERP',
      description: 'ERP for IT service providers. Ticket tracking, billing, and resource management.',
      keywords: 'msp software, it services erp, managed services platform, it billing'
    },
    'freelancers': {
      title: 'Freelancer Business Management Software | Oru ERP',
      description: 'Simplified ERP for freelancers. Invoicing, time tracking, and client management.',
      keywords: 'freelancer software, freelance invoicing, time tracking, freelance management'
    }
  };

  // Meta tags for comparison pages
  const comparisonPages: Record<string, { title: string; description: string; keywords: string }> = {
    'odoo': {
      title: 'Oru ERP vs Odoo: Complete Feature Comparison | 2026',
      description: 'Compare Oru ERP vs Odoo. See why agencies choose Oru for better features, pricing, and support.',
      keywords: 'oru vs odoo, erp comparison, odoo alternative, best erp for agencies'
    },
    'sap-business-one': {
      title: 'Oru ERP vs SAP Business One: Detailed Comparison',
      description: 'Oru ERP vs SAP Business One comparison. Better pricing, faster setup, agency-focused features.',
      keywords: 'oru vs sap business one, erp comparison, sap alternative, enterprise software'
    },
    'monday': {
      title: 'Oru ERP vs Monday.com: Feature & Price Comparison',
      description: 'Compare Oru ERP with Monday.com. Full ERP vs project management tool - which is right for you?',
      keywords: 'oru vs monday, monday alternative, project management software, erp comparison'
    },
    'zoho': {
      title: 'Oru ERP vs Zoho One: Complete Comparison Guide',
      description: 'Oru ERP vs Zoho One comparison. See why agencies prefer Oru for integrated management.',
      keywords: 'oru vs zoho, zoho alternative, erp comparison, business suite'
    },
    'netsuite': {
      title: 'Oru ERP vs NetSuite: Feature & Pricing Comparison',
      description: 'Oru ERP vs NetSuite comparison. Modern alternative to NetSuite at 1/3 the cost.',
      keywords: 'oru vs netsuite, netsuite alternative, cloud erp, enterprise resource planning'
    },
    'hubspot': {
      title: 'Oru ERP vs HubSpot: Complete Business Comparison',
      description: 'Oru ERP vs HubSpot. Full ERP platform vs CRM - which fits your agency better?',
      keywords: 'oru vs hubspot, hubspot alternative, crm vs erp, hubspot comparison'
    },
    'asana': {
      title: 'Oru ERP vs Asana: Project Management vs Full ERP',
      description: 'Oru ERP vs Asana comparison. Complete ERP vs task management - features and pricing.',
      keywords: 'oru vs asana, asana alternative, project management, task management software'
    },
    'clickup': {
      title: 'Oru ERP vs ClickUp: Full Platform Comparison',
      description: 'Oru ERP vs ClickUp comparison. ERP platform vs all-in-one workspace management.',
      keywords: 'oru vs clickup, clickup alternative, project management, workspace software'
    },
    'freshworks': {
      title: 'Oru ERP vs Freshworks: Business Software Comparison',
      description: 'Oru ERP vs Freshworks comparison. Complete ERP vs customer engagement platform.',
      keywords: 'oru vs freshworks, freshworks alternative, customer engagement, erp software'
    }
  };

  // Meta tags for feature pages
  const featurePages: Record<string, { title: string; description: string; keywords: string }> = {
    'project-management': {
      title: 'Best Project Management Software for Agencies | Oru ERP',
      description: 'Project management features in Oru ERP. Gantt charts, resource allocation, timeline tracking.',
      keywords: 'best project management software, agency project management, project tracking tool'
    },
    'crm': {
      title: 'CRM Software for Service Businesses | Oru ERP',
      description: 'Complete CRM system in Oru ERP. Lead management, pipeline tracking, client relationships.',
      keywords: 'best crm software, customer relationship management, lead management, sales crm'
    },
    'hr-management': {
      title: 'HR Management Software for Agencies | Oru ERP',
      description: 'HR module in Oru ERP. Employee records, payroll, benefits, performance tracking.',
      keywords: 'best hr software, employee management, payroll system, hr system for agencies'
    },
    'financial-management': {
      title: 'Financial Management Software | Oru ERP',
      description: 'Finance module in Oru ERP. Accounting, GL, financial reporting, budget tracking.',
      keywords: 'accounting software, financial management system, accounting erp, gl system'
    },
    'invoicing-billing': {
      title: 'Invoicing & Billing Software for Agencies | Oru ERP',
      description: 'Automated invoicing in Oru ERP. Recurring billing, multi-currency, payment tracking.',
      keywords: 'invoicing software, billing system, automated invoicing, professional invoices'
    },
    'time-tracking': {
      title: 'Time Tracking Software for Billable Hours | Oru ERP',
      description: 'Time tracking in Oru ERP. Billable hours, project allocation, productivity reports.',
      keywords: 'time tracking software, billable hours tracker, employee time tracking, project hours'
    },
    'team-collaboration': {
      title: 'Team Collaboration Software | Oru ERP',
      description: 'Built-in collaboration tools. Chat, document sharing, team workspaces, notifications.',
      keywords: 'team collaboration software, team chat, document sharing, workplace communication'
    },
    'reporting-analytics': {
      title: 'Business Analytics & Reporting Software | Oru ERP',
      description: 'Analytics in Oru ERP. Custom dashboards, KPI tracking, automated reports.',
      keywords: 'business analytics, reporting software, data analytics, dashboard software'
    },
    'inventory-management': {
      title: 'Inventory Management Software | Oru ERP',
      description: 'Inventory module in Oru ERP. Stock tracking, SKU management, warehouse operations.',
      keywords: 'inventory management software, stock tracking, warehouse management, inventory system'
    },
    'client-portal': {
      title: 'White-Label Client Portal Software | Oru ERP',
      description: 'Client portal in Oru ERP. Document sharing, project visibility, collaboration features.',
      keywords: 'client portal software, white label portal, client collaboration, document portal'
    }
  };

  // Endpoint to get meta tags for any page
  fastify.get('/api/seo/meta/:pageType/:pageSlug', async (request, reply) => {
    const { pageType, pageSlug } = request.params as { pageType: string; pageSlug: string };

    let meta = null;

    if (pageType === 'industries' && industryPages[pageSlug]) {
      meta = industryPages[pageSlug];
    } else if (pageType === 'compare' && comparisonPages[pageSlug]) {
      meta = comparisonPages[pageSlug];
    } else if (pageType === 'features' && featurePages[pageSlug]) {
      meta = featurePages[pageSlug];
    }

    if (!meta) {
      return reply.status(404).send({ error: 'Page not found' });
    }

    return reply.send(meta);
  });
}
