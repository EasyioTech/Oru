# Oru ERP (Oru ERP)

![Oru ERP Banner](https://img.shields.io/badge/BuildFlow-ERP-blue?style=for-the-badge&logo=react)
![Production Ready](https://img.shields.io/badge/Status-Production--Level-green?style=for-the-badge)
![Multi-tenant](https://img.shields.io/badge/Architecture-Multi--Tenant-orange?style=for-the-badge)

## 🚀 The Global Standard for Industrial & Agency ERP

Oru ERP is a production-grade, highly scalable, and feature-rich Enterprise Resource Planning system. It is specifically architected for **industrial service providers** and **agencies** who require rigorous data isolation, real-time tracking, and automated business workflows.

From **Super Admin platform governance** to **individual employee productivity**, BuildFlow provides a seamless end-to-end experience for modern enterprises.

---

## 🏗️ Technical Architecture: "Total Isolation" Multi-Tenancy

BuildFlow utilizes a state-of-the-art **Database-per-Tenant** architecture, ensuring the highest level of security and performance.

- **Main Database (`oru_erp`)**: Acts as the global control plane, managing tenant registration, system-wide health, and subscription catalog.
- **Agency Databases**: Every agency (tenant) is provisioned with its own dedicated PostgreSQL database. This ensures:
    - **Zero Data Leaks**: Physical separation of tenant data.
    - **Custom Performance Tuning**: Independent indexing and scaling per tenant.
    - **Reliable Backups**: Granular, per-agency backup and restore capabilities.

---

## 👑 The Hierarchy of Power: Roles & Capabilities

### 1. 🛡️ Super Admin (The Platform Architect)
Responsible for the entire ecosystem.
- **Automated Provisioning**: One-click onboarding of new agencies with dynamic database creation.
- **Subscription Management**: Define tiered plans, feature sets, and page catalogs.
- **Global Insights**: High-level analytics across all tenants, health monitoring, and system metrics.
- **Platform Security**: Global user identity management and system-wide settings.

### 2. 🏢 Agency Admin (The Workspace Owner)
Total control over their specific agency workspace.
- **Organizational Structure**: Define departments, parent-child agency relationships, and branches.
- **Role-Based Access Control (RBAC)**: Fine-grained permissions for every employee, manager, and auditor.
- **White-Labeling**: Custom branding, domain mapping, and workspace personalization.

### 3. 👥 HR & Employee Management (The Pulse)
Streamlining the human side of the business.
- **Employee Lifecycle**: From recruitment pipelines to digital onboarding and exit management.
- **Attendance & Leave**: Geo-fenced attendance tracking, biometric integration, and multi-level leave approval workflows.
- **Performance (KPIs)**: Intelligent appraisal systems, skill tracking, and performance analytics.
- **Payroll**: Statutory compliance (PF, ESI, Tax), automated salary slips, and professional reimbursement handling.

### 4. 📊 Project Lifecycle & "True" Job Costing
The heart of industrial operations.
- **Deep Job Costing**: Track every rupee spent on materials, labor, and machinery per project in real-time.
- **Gantt & Scheduling**: Visual project timelines with dependency tracking and resource allocation.
- **Field-to-Office Sync**: Real-time site updates, task completion tracking, and site photo logging.
- **Asset Management**: Tracking heavy machinery, maintenance schedules, and utilization rates.

### 5. 💰 Finance & Accounting (Production-Grade)
A robust financial engine built for accuracy.
- **Multi-Tenant Ledger**: Double-entry accounting with automated journal generation.
- **Tax Compliance**: Ready for modern markets (e.g., Indian GST, VAT) with automated tax calculations.
- **Receivables & Payables**: Comprehensive invoice management, payment tracking, and vendor credit limits.
- **Bank Reconciliation**: Intelligent matching of bank transactions with internal ledger entries.

### 6. 📦 Supply Chain & Procurement
- **Inventory Control**: Serialized inventory, batch tracking, and multi-warehouse support.
- **Bill of Materials (BOM)**: Management of complex kits and manufacturing recipes.
- **Procurement Workflows**: Requisition-to-purchase-order automation with vendor evaluation.

### 7. 🔌 Integration Hub
- **External Connections**: Seamlessly connect with **Zapier**, **Make.com**, and custom webhooks.
- **API Management**: Generate and manage API keys with granular rate limits and permissions.
- **Real-time Monitoring**: Detailed logs for every sync operation, API call, and webhook event.

### 8. 🧠 AI & Intelligent Automation
- **Predictive Analytics**: Forecasting revenue, project delays, and resource bottlenecks.
- **Intelligent Document Processing**: Automated extraction of data from PDF invoices and contracts.
- **Smart Recommendations**: AI-driven tips for improving efficiency and reducing costs.

---

## 🛠️ State-of-the-Art Tech Stack

| Feature | Technology |
| :--- | :--- |
| **Frontend** | React 18, TypeScript, Vite |
| **Styling** | TailwindCSS, shadcn/ui (Premium Neo-Brutalist Aesthetic) |
| **State Management** | Zustand |
| **Data Fetching** | React Query (TanStack Query) |
| **Backend** | Node.js 20, Express.js |
| **Primary Database** | PostgreSQL 15 |
| **Caching/Session** | Redis 7 |
| **Real-time** | Socket.io |
| **Deployment** | Docker, Nginx, CI/CD Ready |

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** v20.x or higher
- **Docker** & **Docker Compose**
- **PostgreSQL** & **Redis** (Managed or Dockerized)

### Quick Launch
1. **Clone & Install**:
   ```powershell
   npm install
   ```
2. **Environment Setup**:
   Copy `.env.example` to `.env` and configure your credentials.
3. **Run Everything**:
   ```powershell
   npm run dev
   ```
   *This starts the Backend on port 3000 and the Frontend on port 5173.*

---

## 🌍 Production Deployment
The platform is optimized for VPS/Cloud deployments using Docker Compose. Refer to `DOCKER-SETUP.md` for full production orchestration details.

---

## ⚖️ License
Oru ERP is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Built with ❤️ for the future of industrial efficiency.**
