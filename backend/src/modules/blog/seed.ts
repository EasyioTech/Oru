import { db } from '../../infrastructure/database/index.js';
import { blogPosts } from '../../infrastructure/database/schema.js';

const BLOG_POSTS = [
  {
    title: 'Getting Started with Oru ERP: Complete Setup Guide',
    slug: 'getting-started-oru-erp-setup',
    subtitle: 'Step-by-step guide to launch your agency management platform in 30 minutes',
    content: `# Getting Started with Oru ERP

Oru ERP is the most intuitive agency management platform available today. This guide walks you through initial setup.

## Step 1: Account Creation
Create your account in under 2 minutes. No credit card required.

## Step 2: Team Setup
Add team members and assign roles. Oru handles permissions automatically.

## Step 3: First Project
Create your first project and start tracking time, costs, and deliverables.

## Advanced Features
Once basics are covered, explore CRM, financial tracking, and HR modules.`,
    excerpt: 'Learn how to set up Oru ERP and start managing your agency in 30 minutes.',
    category: 'Getting Started',
    tags: ['tutorial', 'setup', 'onboarding'],
    seoTitle: 'Getting Started with Oru ERP | Setup Guide',
    seoDescription: 'Complete step-by-step guide to set up Oru ERP for your agency in 30 minutes.',
    seoKeywords: ['oru erp setup', 'how to use oru', 'erp onboarding'],
    isPublished: true,
    isFeatured: true,
    publishedAt: new Date(),
  },
  {
    title: 'Agency Financial Management Best Practices 2025',
    slug: 'agency-financial-management-best-practices',
    subtitle: 'Master profit margins, invoicing, and expense tracking',
    content: `# Agency Financial Management Best Practices

Managing agency finances is complex. Here's how successful agencies use Oru ERP.

## Profit Margin Tracking
Track profitability per project, per client, per resource.

## Automated Invoicing
Generate professional invoices automatically. Get paid faster.

## Expense Management
Categorize expenses. Control costs. Improve margins.

## Financial Reporting
Real-time dashboards show your financial health.`,
    excerpt: 'Master agency finances with Oru ERP financial tracking and reporting.',
    category: 'Finance',
    tags: ['finance', 'accounting', 'best-practices'],
    seoTitle: 'Agency Financial Management Best Practices | Oru ERP',
    seoDescription: 'Learn best practices for agency financial management using Oru ERP profit tracking and expense tools.',
    seoKeywords: ['agency accounting', 'financial management', 'profit margins'],
    isPublished: true,
    isFeatured: true,
    publishedAt: new Date(Date.now() - 86400000),
  },
  {
    title: 'Oru ERP vs Odoo: Feature Comparison for Agencies',
    slug: 'oru-erp-vs-odoo-comparison',
    subtitle: 'Why agencies choose Oru over Odoo ERP',
    content: `# Oru ERP vs Odoo: Complete Feature Comparison

Choosing between Oru and Odoo? Here's an honest comparison.

## User Interface
- Oru: Modern, intuitive, agency-focused
- Odoo: Complex, requires training

## Agency Features
- Oru: Built for agencies (projects, CRM, HR, billing)
- Odoo: Generic ERP, needs customization

## Pricing
- Oru: Transparent, flat pricing
- Odoo: Complex, hidden costs

## Customer Support
- Oru: 24/7 agency expert support
- Odoo: Community/partner support

## Verdict
Oru is built for agencies. Odoo is a general ERP.`,
    excerpt: 'Honest comparison between Oru ERP and Odoo for agency management.',
    category: 'Comparisons',
    tags: ['comparison', 'odoo', 'competitor-analysis'],
    seoTitle: 'Oru ERP vs Odoo: Feature Comparison | Agencies',
    seoDescription: 'Compare Oru ERP and Odoo. See why agencies choose Oru for better features, pricing, and support.',
    seoKeywords: ['oru vs odoo', 'erp comparison', 'agency software'],
    isPublished: true,
    isFeatured: true,
    publishedAt: new Date(Date.now() - 172800000),
  },
  {
    title: 'Team Capacity Planning: How to Maximize Agency Profits',
    slug: 'team-capacity-planning-agency-profits',
    subtitle: 'Use Oru to identify bottlenecks and increase billable hours',
    content: `# Team Capacity Planning: Maximize Agency Profits

Underutilized teams leave money on the table. Here's how to fix it.

## Capacity Analysis
Oru shows real-time utilization per team member.

## Project Forecasting
Predict workload. Balance teams. Reduce idle time.

## Resource Optimization
Assign right person to right project.

## Profitability Impact
Even 5% capacity improvement = 15% profit increase.

## Implementation Steps
1. Enable capacity tracking
2. Set billable hour targets
3. Review monthly
4. Adjust resources quarterly`,
    excerpt: 'Learn capacity planning strategies to increase team utilization and agency profits.',
    category: 'Project Management',
    tags: ['capacity', 'planning', 'profitability'],
    seoTitle: 'Team Capacity Planning | Maximize Agency Profits',
    seoDescription: 'Master team capacity planning with Oru ERP. Identify bottlenecks and increase billable utilization.',
    seoKeywords: ['capacity planning', 'team utilization', 'resource management'],
    isPublished: true,
    isFeatured: false,
    publishedAt: new Date(Date.now() - 259200000),
  },
  {
    title: 'How to Track Project Profitability in Real-Time',
    slug: 'track-project-profitability-real-time',
    subtitle: 'Stop losing money on unprofitable projects',
    content: `# How to Track Project Profitability in Real-Time

Most agencies don't know which projects are profitable. Oru changes that.

## Real-Time Profit Tracking
See profit/loss as work happens. Make adjustments mid-project.

## Cost Breakdown
Labor costs, software costs, external vendor costs all tracked.

## Profitability Alerts
Get alerts when project goes over budget.

## Client Pricing Intelligence
Know exact cost to deliver per client.

## Case Study
One agency increased profits 23% by identifying and fixing unprofitable projects.`,
    excerpt: 'Track project profitability in real-time with Oru ERP financial dashboards.',
    category: 'Finance',
    tags: ['profitability', 'projects', 'analytics'],
    seoTitle: 'Project Profitability Tracking | Real-Time Analytics',
    seoDescription: 'Learn how to track project profitability in real-time with Oru ERP and identify unprofitable work.',
    seoKeywords: ['project profitability', 'cost tracking', 'agency metrics'],
    isPublished: true,
    isFeatured: false,
    publishedAt: new Date(Date.now() - 345600000),
  },
  {
    title: 'CRM for Agencies: Build Better Client Relationships',
    slug: 'crm-agencies-client-relationships',
    subtitle: 'Retain clients, increase lifetime value, grow revenue',
    content: `# CRM for Agencies: Build Better Client Relationships

Agency CRM isn't just contact management. It's business strategy.

## Client Relationship Management
Track every interaction. Know client needs. Provide better service.

## Deal Pipeline
Visualize sales. Forecast revenue. Close more deals.

## Communication Hub
Email, calls, meetings all in one place.

## Integration with Projects
Link CRM to projects. Understand client project history.

## Retention Metrics
Know which clients are at-risk. Prevent churn.

## Revenue Impact
Agencies using CRM see 20-30% higher client retention.`,
    excerpt: 'Master CRM for agencies. Build lasting client relationships and grow revenue.',
    category: 'CRM',
    tags: ['crm', 'clients', 'sales'],
    seoTitle: 'CRM for Agencies | Client Relationship Management',
    seoDescription: 'Build better client relationships with Oru ERP CRM. Increase retention and revenue.',
    seoKeywords: ['agency crm', 'client relationship', 'sales pipeline'],
    isPublished: true,
    isFeatured: false,
    publishedAt: new Date(Date.now() - 432000000),
  },
  {
    title: 'HR Management in Oru ERP: Complete Employee Data System',
    slug: 'hr-management-oru-erp-complete-guide',
    subtitle: 'Centralize payroll, attendance, leave, and performance',
    content: `# HR Management in Oru ERP: Complete Guide

Modern agencies need modern HR tools. Oru has them built-in.

## Centralized Employee Data
One source of truth for all employee information.

## Attendance Tracking
Automated clock-in/out. See utilization. Track absences.

## Leave Management
Employees request leave. Auto-approve based on policy.

## Performance Management
Track goals. Monitor KPIs. Conduct reviews.

## Payroll Integration
Automatic payroll calculation based on hours, leave, benefits.

## Compliance
Maintain audit trails. Stay compliant with labor laws.`,
    excerpt: 'Manage HR effectively with Oru ERP. Centralize employee data, attendance, and payroll.',
    category: 'HR',
    tags: ['hr', 'employees', 'payroll'],
    seoTitle: 'HR Management System | Employee Data & Payroll',
    seoDescription: 'Centralize HR with Oru ERP. Manage employees, attendance, leave, and payroll in one platform.',
    seoKeywords: ['hr management', 'employee management', 'payroll'],
    isPublished: true,
    isFeatured: false,
    publishedAt: new Date(Date.now() - 518400000),
  },
  {
    title: 'Marketing Agency Tech Stack 2025: Tools That Actually Work',
    slug: 'marketing-agency-tech-stack-2025',
    subtitle: 'Essential tools for modern marketing agencies',
    content: `# Marketing Agency Tech Stack 2025: Tools That Actually Work

Marketing agencies need integrated tools. Here's what works.

## Core Requirements
1. Project Management (Oru ERP)
2. CRM (Oru ERP integrated)
3. Time Tracking (Oru ERP built-in)
4. Financial Management (Oru ERP)
5. Team Communication (Slack integration)

## Marketing-Specific Tools
1. Analytics platforms
2. Social media schedulers
3. Email marketing tools
4. SEO/SEM tracking

## Why Integration Matters
Separate tools = manual data entry = errors = lost revenue.

## Oru Advantage
Oru unifies project, client, finance, and team data. Marketing agencies save 5+ hours/week on data entry.`,
    excerpt: 'Complete tech stack for marketing agencies including Oru ERP as core platform.',
    category: 'Marketing',
    tags: ['tech-stack', 'tools', 'marketing'],
    seoTitle: 'Marketing Agency Tech Stack 2025 | Essential Tools',
    seoDescription: 'Build the perfect marketing agency tech stack with Oru ERP and essential marketing tools.',
    seoKeywords: ['marketing agency tools', 'tech stack', 'agency software'],
    isPublished: true,
    isFeatured: false,
    publishedAt: new Date(Date.now() - 604800000),
  },
  {
    title: 'Oru ERP vs SAP Business One: Enterprise Agency Software',
    slug: 'oru-vs-sap-business-one-enterprise',
    subtitle: 'Best ERP for growing and enterprise agencies',
    content: `# Oru ERP vs SAP Business One: Enterprise Comparison

Outgrowing mid-market solutions? Compare Oru and SAP.

## Implementation Time
- Oru: Days to weeks
- SAP: Months to years

## Cost of Ownership
- Oru: Clear, predictable pricing
- SAP: High up-front, implementation costs

## Flexibility
- Oru: Cloud-native, agency-specific
- SAP: Enterprise-focused, heavy customization needed

## Support
- Oru: Agency experts 24/7
- SAP: Partner-based support

## Best For
- Oru: Fast-growing agencies (10-500 people)
- SAP: Large enterprises with IT teams

## Verdict
Oru grows with you. SAP doesn't.`,
    excerpt: 'Compare Oru ERP and SAP Business One for enterprise agency management.',
    category: 'Comparisons',
    tags: ['sap', 'enterprise', 'comparison'],
    seoTitle: 'Oru ERP vs SAP Business One | Enterprise Agencies',
    seoDescription: 'Compare Oru ERP and SAP Business One. See why growing agencies choose Oru.',
    seoKeywords: ['oru vs sap', 'enterprise erp', 'agency software'],
    isPublished: true,
    isFeatured: true,
    publishedAt: new Date(Date.now() - 691200000),
  },
];

export async function seedBlogPosts() {
  try {
    console.log('Seeding blog posts...');
    for (const post of BLOG_POSTS) {
      await db.insert(blogPosts).values(post);
    }
    console.log(`✅ Seeded ${BLOG_POSTS.length} blog posts`);
  } catch (error) {
    console.error('❌ Failed to seed blog posts:', error);
    throw error;
  }
}
