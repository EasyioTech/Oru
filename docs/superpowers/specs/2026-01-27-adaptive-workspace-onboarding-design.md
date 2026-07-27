# Adaptive Workspace Onboarding & Dashboard Design Spec

**Status:** Design Approved  
**Date:** 2026-07-27  
**Version:** 1.0  
**Author:** Product Team + Claude Code  

---

## 1. Executive Summary

This spec defines a **workspace-driven adaptive experience** for ORU ERP that scales seamlessly from a solo freelancer (Day 1) to a 500-person enterprise (Year 5) using a single design system.

**Core Philosophy:**

Instead of guiding users through a linear onboarding "funnel," the system maintains a **real-time workspace profile** that drives all UI decisions. The dashboard, navigation, and recommendations are not hardcoded—they are generated from workspace state.

**Key Outcomes:**

- New users land on a dashboard that feels prepared, not empty
- Product grows with them; no "onboarding ends" moment
- Enterprise customers use the same code paths as solo users
- Every UI element serves a decision-making purpose
- System is intelligent, not instructional

---

## 2. Core Architecture

### 2.1 Workspace Profile

The system maintains a single source of truth for each workspace:

```typescript
interface WorkspaceProfile {
  workspace_id: string;
  created_at: ISO8601;
  
  profile: {
    // Module enablement and usage
    modules: {
      [module_key]: {
        enabled: boolean;
        usage_score: 0-100;           // 0 = never used, 100 = daily heavy use
        data_count: number;            // Items in this module
        last_activity?: ISO8601;
        suggestion_score?: 0-100;      // How strongly we recommend enabling
        suggestion_reason?: string;    // "members_added", "data_imported", etc.
      }
    };

    // Team collaboration metrics
    collaboration: {
      members_total: number;
      members_active: number;         // Active in last 7 days
      invitations_pending: number;
      is_solo: boolean;               // true if members_total === 1
    };

    // Adoption and engagement
    adoption: {
      days_active: number;            // Days since workspace creation
      last_activity: ISO8601;
      engagement_score: 0-100;        // Computed from actions/week
      stage: "initializing" | "activating" | "operating" | "optimizing" | "scaling";
    };

    // Workspace health indicators
    health: {
      overall_score: 0-100;
      needs_attention: string[];      // ["email_domain", "company_logo"]
      at_risk: string[];
      strengths: string[];
    };

    // Smart recommendations
    recommendations: Recommendation[];

    // Quick wins for momentum
    quick_wins: QuickWin[];
  };
}

interface Recommendation {
  id: string;
  priority: 0-100;                    // Higher = show first
  type: "action" | "insight" | "suggestion";
  label: string;                      // "Invite your first teammate"
  description?: string;
  action_url?: string;
  requires?: string[];                // ["workspace_exists", "client_exists"]
  condition?: (ws: WorkspaceProfile) => boolean;
  impact: "high" | "medium" | "low";
  urgency: "now" | "soon" | "later";
  actionable: boolean;                // Can user do it right now?
}

interface QuickWin {
  id: string;
  label: string;                      // "Add Company Logo"
  estimate_minutes: number;
  completed: boolean;
  completed_at?: ISO8601;
}
```

**Update Frequency:** Real-time on action completion; recalculated every 24h for usage scores.

---

### 2.2 Three Core Engines

#### Engine 1: Capability Engine

**Purpose:** Determine what the workspace can do.

**Input:** Workspace profile  
**Output:** List of enabled capabilities

```typescript
interface Capabilities {
  enabled_modules: ModuleKey[];
  available_modules: { module: ModuleKey; reason: string }[];
  features: string[];
  user_permissions: string[];
}

function getCapabilities(workspace: WorkspaceProfile): Capabilities {
  const enabled = Object.entries(workspace.profile.modules)
    .filter(([_, module]) => module.enabled)
    .map(([key, _]) => key);

  const available = Object.entries(workspace.profile.modules)
    .filter(([_, module]) => !module.enabled && module.suggestion_score > 0)
    .map(([key, module]) => ({
      module: key,
      reason: module.suggestion_reason || "available_on_request"
    }));

  return {
    enabled_modules: enabled,
    available_modules: available,
    features: deriveFeatures(workspace),
    user_permissions: derivePermissions(workspace)
  };
}
```

**Used by:**
- Navigation visibility
- Module access control
- Permission checks
- Quick action display

---

#### Engine 2: Context Engine

**Purpose:** Build dashboard content from workspace state.

**Input:** Workspace profile  
**Output:** Dashboard sections with data

```typescript
interface DashboardContext {
  greeting: string;
  status: "initializing" | "activating" | "operating" | "optimizing" | "scaling";
  sections: DashboardSection[];
  needs_setup: boolean;
}

function buildDashboardContext(workspace: WorkspaceProfile): DashboardContext {
  const days_active = workspace.profile.adoption.days_active;
  const modules_active = getActiveModuleCount(workspace);
  const engagement = workspace.profile.adoption.engagement_score;

  return {
    greeting: generateGreeting(workspace),
    status: workspace.profile.adoption.stage,
    
    sections: [
      buildCommandCenter(workspace),
      buildWorkspaceHealth(workspace),
      buildModuleActivity(workspace),
      buildRecentActivity(workspace)
    ],
    
    needs_setup: days_active < 30 && engagement < 50
  };
}

// Command Center: Greeting + Status + Next Best Action
function buildCommandCenter(ws: WorkspaceProfile): DashboardSection {
  const best_action = ws.profile.recommendations
    .filter(r => r.actionable)
    .sort((a, b) => b.priority - a.priority)[0];

  return {
    type: "command_center",
    greeting: `Good morning, ${ws.owner_name}`,
    subtitle: ws.profile.adoption.days_active < 7 
      ? "Your workspace is ready. Let's complete setup."
      : "Here's what's happening in your workspace",
    
    next_best_action: best_action ? {
      label: best_action.label,
      description: best_action.description,
      action_url: best_action.action_url,
      urgency: best_action.urgency
    } : null,
    
    status_indicators: {
      health_score: ws.profile.health.overall_score,
      team_members: ws.profile.collaboration.members_active,
      modules_active: getActiveModuleCount(ws)
    }
  };
}

// Workspace Health: Permanent status card
function buildWorkspaceHealth(ws: WorkspaceProfile): DashboardSection {
  return {
    type: "workspace_health",
    score: ws.profile.health.overall_score,
    status: classifyHealth(ws.profile.health.overall_score),
    needs_attention: ws.profile.health.needs_attention,
    strengths: ws.profile.health.strengths,
    at_risk: ws.profile.health.at_risk,
    
    // Only show if < 30 days old
    quick_wins: ws.profile.adoption.days_active < 30 
      ? ws.profile.quick_wins 
      : undefined
  };
}

// Module Activity: Shows data if it exists
function buildModuleActivity(ws: WorkspaceProfile): DashboardSection {
  const active_modules = Object.entries(ws.profile.modules)
    .filter(([_, m]) => m.enabled && m.data_count > 0)
    .map(([key, module]) => ({
      module: key,
      data_count: module.data_count,
      usage: module.usage_score,
      last_activity: module.last_activity
    }))
    .sort((a, b) => b.usage - a.usage)
    .slice(0, 4);

  if (active_modules.length === 0) {
    return {
      type: "workspace_progress",
      title: "Workspace Progress",
      description: "Let's get started",
      progress_items: buildProgressItems(ws)
    };
  }

  return {
    type: "module_activity",
    title: "Your Workspace",
    modules: active_modules,
    quick_actions: buildQuickActions(ws)
  };
}

// Recent Activity: Timeline of workspace events
function buildRecentActivity(ws: WorkspaceProfile): DashboardSection {
  return {
    type: "recent_activity",
    title: "Recent Activity",
    items: fetchWorkspaceActivityTimeline(ws.workspace_id, limit: 10),
    quick_actions: buildQuickActions(ws)
  };
}
```

**Used by:**
- Dashboard rendering
- Data aggregation
- Content selection

---

#### Engine 3: Recommendation Engine

**Purpose:** Surface the most relevant action/insight for right now.

**Input:** Workspace profile, user context  
**Output:** Prioritized list of recommendations

```typescript
const recommendationLibrary: Recommendation[] = [
  {
    id: "invite_team",
    priority: 100,
    type: "action",
    label: "Invite your first teammate",
    description: "Working together unlocks collaboration features.",
    action_url: "/settings/team",
    requires: ["workspace_exists"],
    condition: (ws) => ws.profile.collaboration.members_total === 1,
    impact: "high",
    urgency: "now",
    actionable: true
  },

  {
    id: "add_first_client",
    priority: 90,
    type: "action",
    label: "Add your first client",
    description: "Clients are the starting point for projects and invoicing.",
    action_url: "/crm/clients/new",
    requires: ["crm_enabled"],
    condition: (ws) => ws.profile.modules.crm.enabled && 
                        ws.profile.modules.crm.data_count === 0,
    impact: "high",
    urgency: "now",
    actionable: true
  },

  {
    id: "create_first_project",
    priority: 85,
    type: "action",
    label: "Create your first project",
    description: "Projects organize work and assign tasks.",
    action_url: "/projects/new",
    requires: ["projects_enabled", "client_exists"],
    condition: (ws) => ws.profile.modules.projects.enabled &&
                        ws.profile.modules.crm.data_count > 0 &&
                        ws.profile.modules.projects.data_count === 0,
    impact: "high",
    urgency: "soon",
    actionable: (ws) => ws.profile.modules.crm.data_count > 0
  },

  {
    id: "verify_email_domain",
    priority: 70,
    type: "action",
    label: "Verify your email domain",
    description: "Required for sending invoices and email templates.",
    action_url: "/settings/email",
    requires: ["workspace_exists"],
    condition: (ws) => !ws.profile.settings?.email_verified,
    impact: "high",
    urgency: "soon",
    actionable: true
  },

  {
    id: "enable_hr_module",
    priority: 45,
    type: "suggestion",
    label: "Enable HR module",
    description: `You have ${ws.profile.collaboration.members_total} team members. Set up departments and roles.`,
    action_url: "/settings/modules/hr/enable",
    condition: (ws) => !ws.profile.modules.hr.enabled &&
                        ws.profile.collaboration.members_total > 3,
    impact: "medium",
    urgency: "soon",
    actionable: true
  },

  {
    id: "configure_branding",
    priority: 50,
    type: "action",
    label: "Add your company logo",
    description: "Used in invoices, emails, and client-facing documents.",
    action_url: "/settings/branding",
    condition: (ws) => !ws.profile.settings?.logo_uploaded,
    impact: "medium",
    urgency: "later",
    actionable: true
  },

  {
    id: "assign_project_owners",
    priority: 75,
    type: "insight",
    label: "Assign owners to projects",
    description: "Projects without owners often miss deadlines.",
    action_url: "/projects",
    condition: (ws) => ws.profile.modules.projects.data_count > 0 &&
                        hasUnownedProjects(ws),
    impact: "high",
    urgency: "now",
    actionable: true
  }
];

function getActionableRecommendations(ws: WorkspaceProfile): Recommendation[] {
  return recommendationLibrary
    .filter(rec => {
      // Check if all requirements are met
      if (rec.requires) {
        const met = rec.requires.every(req => 
          checkRequirement(ws, req)
        );
        if (!met) return false;
      }

      // Check condition
      if (rec.condition && !rec.condition(ws)) return false;

      // Check if actionable (can user do it now?)
      if (typeof rec.actionable === "function") {
        return rec.actionable(ws);
      }
      return rec.actionable;
    })
    .sort((a, b) => b.priority - a.priority);
}

function getNextBestAction(ws: WorkspaceProfile): Recommendation | null {
  const actionable = getActionableRecommendations(ws);
  
  // Prioritize by urgency + priority
  const urgency_weight = { "now": 1000, "soon": 100, "later": 10 };
  
  return actionable.sort((a, b) => {
    const a_score = a.priority + urgency_weight[a.urgency];
    const b_score = b.priority + urgency_weight[b.urgency];
    return b_score - a_score;
  })[0];
}
```

**Used by:**
- "Next Best Action" card
- Insight generation
- Notification triggers

---

## 3. Dashboard Architecture

### 3.1 Layout (Constant Across All Stages)

```tsx
<Dashboard>
  <CommandCenter />
  <WorkspaceHealth />
  <ModuleActivityOrProgress />
  <RecentActivityTimeline />
</Dashboard>
```

**Same component structure. Content is generated, not hardcoded.**

### 3.2 Command Center Section

Appears on every dashboard.

```tsx
interface CommandCenterProps {
  workspace: WorkspaceProfile;
}

export function CommandCenter({ workspace }: CommandCenterProps) {
  const greeting = generateGreeting(workspace);
  const best_action = getNextBestAction(workspace);
  const stage = workspace.profile.adoption.stage;

  return (
    <div className="space-y-4">
      {/* Greeting */}
      <div>
        <h1 className="text-3xl font-bold text-zinc-900">
          {greeting.main}
        </h1>
        <p className="text-sm text-zinc-600 mt-1">
          {greeting.subtitle}
        </p>
      </div>

      {/* Status Indicators (if past Day 7) */}
      {workspace.profile.adoption.days_active > 7 && (
        <div className="grid grid-cols-3 gap-4">
          <StatusCard
            label="Team Members"
            value={workspace.profile.collaboration.members_active}
            icon={Users}
          />
          <StatusCard
            label="Active Modules"
            value={Object.values(workspace.profile.modules)
              .filter(m => m.enabled).length}
            icon={Package}
          />
          <StatusCard
            label="Workspace Health"
            value={`${workspace.profile.health.overall_score}/100`}
            icon={Heart}
          />
        </div>
      )}

      {/* Next Best Action */}
      {best_action && (
        <RecommendationCard
          recommendation={best_action}
          workspace={workspace}
        />
      )}
    </div>
  );
}

function generateGreeting(ws: WorkspaceProfile) {
  const name = ws.owner_name;
  const days = ws.profile.adoption.days_active;
  const engagement = ws.profile.adoption.engagement_score;

  if (days < 1) {
    return {
      main: `Welcome, ${name}`,
      subtitle: "Your workspace is ready. Let's complete setup."
    };
  }

  if (engagement < 30) {
    return {
      main: `Good morning, ${name}`,
      subtitle: "Let's get your workspace productive."
    };
  }

  return {
    main: `Good morning, ${name}`,
    subtitle: "Here's what's happening in your workspace."
  };
}
```

### 3.3 Workspace Health Section

**Always visible. Always evolving.**

```tsx
interface WorkspaceHealthProps {
  workspace: WorkspaceProfile;
}

export function WorkspaceHealth({ workspace }: WorkspaceHealthProps) {
  const score = workspace.profile.health.overall_score;
  const status = score >= 80 ? "excellent" : 
                 score >= 60 ? "healthy" : 
                 "needs_attention";

  return (
    <Card className="border-zinc-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Workspace Health</CardTitle>
            <CardDescription>
              {statusDescription(status)}
            </CardDescription>
          </div>
          <HealthBadge score={score} status={status} />
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Progress bar */}
        <div>
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium">{score}/100</span>
            <span className="text-xs text-zinc-500">
              {statusLabel(status)}
            </span>
          </div>
          <HealthBar score={score} />
        </div>

        {/* Quick Wins (only < 30 days) */}
        {workspace.profile.adoption.days_active < 30 && 
         workspace.profile.quick_wins.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold">Quick Wins</h4>
            {workspace.profile.quick_wins.map(win => (
              <QuickWinCard
                key={win.id}
                win={win}
                workspace={workspace}
              />
            ))}
          </div>
        )}

        {/* Needs Attention */}
        {workspace.profile.health.needs_attention.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-amber-700">
              Needs Attention
            </h4>
            {workspace.profile.health.needs_attention.map(item => (
              <AttentionItem key={item} item={item} />
            ))}
          </div>
        )}

        {/* Strengths */}
        {workspace.profile.health.strengths.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-emerald-700">
              Strengths
            </h4>
            {workspace.profile.health.strengths.map(item => (
              <StrengthItem key={item} item={item} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

### 3.4 Module Activity or Progress Section

**Conditional: Shows data if modules have content, otherwise shows progress.**

```tsx
export function ModuleActivityOrProgress({ workspace }: Props) {
  const active_modules = Object.entries(workspace.profile.modules)
    .filter(([_, m]) => m.enabled && m.data_count > 0)
    .map(([key, module]) => ({
      module: key,
      data_count: module.data_count,
      usage: module.usage_score
    }))
    .sort((a, b) => b.usage - a.usage)
    .slice(0, 4);

  // If we have data, show module activity
  if (active_modules.length > 0) {
    return <ModuleActivity modules={active_modules} />;
  }

  // Otherwise show Workspace Progress
  if (workspace.profile.adoption.days_active < 30) {
    return <WorkspaceProgress workspace={workspace} />;
  }

  // After 30 days with no data, show encouragement
  return <EmptyStateEncouragement workspace={workspace} />;
}

function WorkspaceProgress({ workspace }: Props) {
  const quick_wins = workspace.profile.quick_wins;
  const completed = quick_wins.filter(w => w.completed).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Workspace Progress</CardTitle>
        <CardDescription>
          {completed} of {quick_wins.length} quick wins completed
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progress bar */}
        <div>
          <ProgressBar 
            value={completed} 
            max={quick_wins.length} 
          />
          <p className="text-xs text-zinc-600 mt-2">
            {Math.round((completed / quick_wins.length) * 100)}% complete
          </p>
        </div>

        {/* Quick Win Cards */}
        <div className="space-y-3">
          {quick_wins.map(win => (
            <QuickWinCard key={win.id} win={win} workspace={workspace} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
```

### 3.5 Recent Activity Timeline

```tsx
export function RecentActivityTimeline({ workspace }: Props) {
  const activities = fetchWorkspaceActivityTimeline(
    workspace.workspace_id,
    limit: 10
  );

  const quick_actions = buildQuickActions(workspace);

  return (
    <div className="grid grid-cols-3 gap-6">
      {/* Timeline */}
      <div className="col-span-2">
        <h3 className="text-sm font-semibold mb-4">Recent Activity</h3>
        <ActivityTimeline items={activities} />
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-sm font-semibold mb-4">Quick Actions</h3>
        <div className="space-y-2">
          {quick_actions.map(action => (
            <QuickActionButton key={action.id} action={action} />
          ))}
        </div>
      </div>
    </div>
  );
}

function buildQuickActions(workspace: WorkspaceProfile): QuickAction[] {
  const actions = [];

  // Always show based on enabled modules
  if (workspace.profile.modules.crm.enabled) {
    actions.push({
      id: "add_client",
      label: "+ Client",
      action_url: "/crm/clients/new",
      icon: UserPlus
    });
  }

  if (workspace.profile.modules.projects.enabled) {
    actions.push({
      id: "add_project",
      label: "+ Project",
      action_url: "/projects/new",
      icon: FolderPlus
    });
  }

  if (workspace.profile.modules.hr.enabled) {
    actions.push({
      id: "add_employee",
      label: "+ Employee",
      action_url: "/hr/employees/new",
      icon: UserCheck
    });
  }

  if (workspace.profile.modules.finance.enabled) {
    actions.push({
      id: "add_invoice",
      label: "+ Invoice",
      action_url: "/finance/invoices/new",
      icon: FileText
    });
  }

  // Sort by usage (most-used module first)
  return actions.sort((a, b) => {
    const a_usage = workspace.profile.modules[a.module]?.usage_score || 0;
    const b_usage = workspace.profile.modules[b.module]?.usage_score || 0;
    return b_usage - a_usage;
  });
}
```

---

## 4. Navigation System

### 4.1 Three Module States

**Active:** Module is enabled and in use  
**Available:** Module exists but not enabled; user can enable  
**Disabled:** Module not relevant for this workspace

```tsx
interface NavigationModule {
  key: string;
  label: string;
  icon: React.ComponentType;
  state: "active" | "available" | "disabled";
  usage_score?: number;           // For active modules
  suggestion_reason?: string;     // For available modules
}

function buildNavigation(workspace: WorkspaceProfile): NavigationModule[] {
  const modules = [];

  Object.entries(workspace.profile.modules).forEach(([key, module]) => {
    if (module.enabled) {
      modules.push({
        key,
        label: formatModuleLabel(key),
        icon: getModuleIcon(key),
        state: "active",
        usage_score: module.usage_score
      });
    } else if (module.suggestion_score > 30) {
      modules.push({
        key,
        label: formatModuleLabel(key),
        icon: getModuleIcon(key),
        state: "available",
        suggestion_reason: module.suggestion_reason
      });
    }
  });

  // Sort active by usage (most-used at top)
  const active = modules.filter(m => m.state === "active")
    .sort((a, b) => (b.usage_score || 0) - (a.usage_score || 0));

  const available = modules.filter(m => m.state === "available");

  return [...active, ...available];
}
```

### 4.2 Sidebar Navigation Component

```tsx
export function Sidebar({ workspace }: Props) {
  const nav_modules = buildNavigation(workspace);

  return (
    <nav className="space-y-1 px-2">
      {/* Core items (always visible) */}
      <NavItem
        icon={<Home />}
        label="Dashboard"
        href="/dashboard"
      />

      <Separator className="my-2" />

      {/* Active modules */}
      {nav_modules
        .filter(m => m.state === "active")
        .map(module => (
          <NavItem
            key={module.key}
            icon={<module.icon />}
            label={module.label}
            href={`/${module.key}`}
            usage_indicator={module.usage_score}
          />
        ))}

      <Separator className="my-2" />

      {/* Available modules */}
      {nav_modules
        .filter(m => m.state === "available")
        .map(module => (
          <NavItemAvailable
            key={module.key}
            icon={<module.icon />}
            label={module.label}
            suggestion_reason={module.suggestion_reason}
            action_url={`/settings/modules/${module.key}/enable`}
          />
        ))}

      <Separator className="my-2" />

      {/* Settings, Admin */}
      <NavItem
        icon={<Settings />}
        label="Settings"
        href="/settings"
      />

      <NavItem
        icon={<ShieldCheck />}
        label="Admin"
        href="/admin"
      />
    </nav>
  );
}

function NavItemAvailable({ label, suggestion_reason, action_url }: Props) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-zinc-600 opacity-60 hover:opacity-100 transition rounded-md">
          <Icon />
          <span>{label}</span>
          <Plus className="h-4 w-4 ml-auto" />
        </button>
      </PopoverTrigger>

      <PopoverContent side="right">
        <div className="space-y-3">
          <p className="text-sm font-medium">{label}</p>
          <p className="text-xs text-zinc-600">
            {getSuggestionText(suggestion_reason)}
          </p>
          <Button size="sm" asChild>
            <Link href={action_url}>Enable Module</Link>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
```

---

## 5. Empty States Strategy

### 5.1 Philosophy

Every empty page teaches. No page says just "No data."

### 5.2 Empty State Template

```tsx
interface EmptyStateProps {
  module: string;
  icon: React.ComponentType;
  title: string;
  description: string;
  benefit_bullets: string[];
  cta_label: string;
  cta_href: string;
}

export function EmptyState({
  module,
  icon: Icon,
  title,
  description,
  benefit_bullets,
  cta_label,
  cta_href
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] px-6">
      <Icon className="h-16 w-16 text-zinc-300 mb-6" />

      <h2 className="text-2xl font-bold text-zinc-900 mb-3">
        {title}
      </h2>

      <p className="text-center text-zinc-600 max-w-sm mb-6">
        {description}
      </p>

      {benefit_bullets.length > 0 && (
        <ul className="space-y-2 mb-8">
          {benefit_bullets.map((bullet, i) => (
            <li key={i} className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-0.5" />
              <span className="text-sm text-zinc-700">{bullet}</span>
            </li>
          ))}
        </ul>
      )}

      <Button asChild>
        <Link href={cta_href}>{cta_label}</Link>
      </Button>
    </div>
  );
}
```

### 5.3 Examples by Module

**CRM - Clients Empty:**
```
Title: Clients are your starting point
Description: Clients are the organizations you work with. 
Once you add your first client, you'll be able to create projects, 
track invoices, and manage their information.

Benefits:
• Create projects for clients
• Track invoices and revenue
• Manage contacts and communications
• Analyze client performance

CTA: [ Add Client ]
```

**Projects - Empty:**
```
Title: Projects organize your work
Description: Projects keep client work organized. 
Create one when you're ready to start tracking work and assigning tasks.

Benefits:
• Assign work to team members
• Track progress and deadlines
• Organize files and documents
• Generate project invoices

CTA: [ Create Project ]
```

**HR - Employees Empty:**
```
Title: Employees manage your team
Description: Add your team members to set up roles, departments, 
and track attendance and performance.

Benefits:
• Organize team by department
• Assign roles and permissions
• Track time and attendance
• Manage leave and benefits

CTA: [ Add Employee ]
```

**Finance - Invoices Empty:**
```
Title: Track revenue with invoices
Description: Invoices record money your clients owe you.

Benefits:
• Create professional invoices
• Track payment status
• Automate payment reminders
• Generate financial reports

CTA: [ Create Invoice ]
```

---

## 6. Quick Wins System

Quick wins are **achievable momentum builders** that appear in the first 30 days.

### 6.1 Quick Win Configuration

```typescript
interface QuickWinLibrary {
  items: QuickWin[];
}

const quickWins: QuickWin[] = [
  {
    id: "add_logo",
    label: "Add Company Logo",
    description: "Used in invoices and client-facing documents",
    estimate_minutes: 2,
    priority: 50,
    action_url: "/settings/branding",
    validation: (ws) => !ws.profile.settings?.logo_uploaded,
    completed_milestone: "✓ Company branding added"
  },

  {
    id: "invite_team",
    label: "Invite Your First Team Member",
    description: "Start collaborating with your team",
    estimate_minutes: 1,
    priority: 100,
    action_url: "/settings/team/invite",
    validation: (ws) => ws.profile.collaboration.members_total === 1,
    completed_milestone: "✓ First team member invited. Your workspace is now collaborative."
  },

  {
    id: "create_client",
    label: "Add Your First Client",
    description: "Add a client to get started",
    estimate_minutes: 2,
    priority: 90,
    action_url: "/crm/clients/new",
    validation: (ws) => ws.profile.modules.crm.enabled && 
                        ws.profile.modules.crm.data_count === 0,
    completed_milestone: "✓ First client added"
  },

  {
    id: "create_project",
    label: "Create Your First Project",
    description: "Organize work and assign tasks",
    estimate_minutes: 5,
    priority: 85,
    action_url: "/projects/new",
    validation: (ws) => ws.profile.modules.projects.enabled &&
                        ws.profile.modules.crm.data_count > 0 &&
                        ws.profile.modules.projects.data_count === 0,
    completed_milestone: "✓ First project created. You can now assign work."
  },

  {
    id: "complete_settings",
    label: "Complete Company Settings",
    description: "Configure your workspace",
    estimate_minutes: 10,
    priority: 60,
    action_url: "/settings",
    validation: (ws) => !ws.profile.settings?.complete,
    completed_milestone: "✓ Company profile completed"
  }
];
```

### 6.2 Quick Win Card Component

```tsx
function QuickWinCard({ win, workspace }: Props) {
  const is_completed = win.completed;
  const is_achievable = win.validation(workspace);

  return (
    <div className={`p-4 rounded-lg border transition ${
      is_completed 
        ? 'border-emerald-200 bg-emerald-50' 
        : 'border-zinc-200 bg-white hover:border-zinc-300'
    }`}>
      <div className="flex items-start gap-3">
        {is_completed ? (
          <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-0.5" />
        ) : (
          <Circle className="h-5 w-5 text-zinc-400 mt-0.5" />
        )}

        <div className="flex-1">
          <div className="flex items-center justify-between">
            <p className={`font-medium ${
              is_completed ? 'text-emerald-900' : 'text-zinc-900'
            }`}>
              {win.label}
            </p>
            <span className="text-xs text-zinc-500">
              ~{win.estimate_minutes} min
            </span>
          </div>
          <p className={`text-sm mt-1 ${
            is_completed ? 'text-emerald-800' : 'text-zinc-600'
          }`}>
            {win.description}
          </p>
        </div>

        {!is_completed && (
          <Button
            size="sm"
            variant="ghost"
            asChild
            disabled={!is_achievable}
          >
            <Link href={win.action_url}>Go</Link>
          </Button>
        )}
      </div>

      {is_completed && (
        <p className="text-xs text-emerald-700 mt-2 ml-8">
          {win.completed_milestone}
        </p>
      )}
    </div>
  );
}
```

---

## 7. Workspace Health Scoring

### 7.1 Health Score Calculation

```typescript
function calculateHealthScore(workspace: WorkspaceProfile): number {
  let score = 100;

  // Team setup (20 points)
  if (workspace.profile.collaboration.members_total === 1) score -= 20;
  else if (workspace.profile.collaboration.members_total < 3) score -= 10;

  // Email verification (15 points)
  if (!workspace.profile.settings?.email_verified) score -= 15;

  // Branding (10 points)
  if (!workspace.profile.settings?.logo_uploaded) score -= 10;

  // Activity (20 points)
  const engagement = workspace.profile.adoption.engagement_score;
  if (engagement < 20) score -= 20;
  else if (engagement < 50) score -= 10;

  // Data in modules (15 points)
  const has_data = Object.values(workspace.profile.modules)
    .some(m => m.enabled && m.data_count > 0);
  if (!has_data && workspace.profile.adoption.days_active > 3) score -= 15;

  // Active collaborators (10 points)
  if (workspace.profile.collaboration.members_active === 0 &&
      workspace.profile.adoption.days_active > 7) score -= 10;

  return Math.max(0, Math.min(100, score));
}

function classifyHealth(score: number): HealthStatus {
  if (score >= 80) return "excellent";
  if (score >= 60) return "healthy";
  if (score >= 40) return "needs_attention";
  return "at_risk";
}
```

### 7.2 Needs Attention Items

```typescript
function identifyNeedsAttention(workspace: WorkspaceProfile): string[] {
  const items = [];

  if (!workspace.profile.settings?.email_verified) {
    items.push("email_domain_not_verified");
  }

  if (!workspace.profile.settings?.logo_uploaded) {
    items.push("company_logo_missing");
  }

  if (workspace.profile.collaboration.members_total === 1 &&
      workspace.profile.adoption.days_active > 3) {
    items.push("team_not_invited");
  }

  if (hasUnownedProjects(workspace)) {
    items.push("projects_without_owners");
  }

  if (workspace.profile.adoption.engagement_score < 30) {
    items.push("low_engagement");
  }

  return items;
}
```

---

## 8. Module Visibility Strategy

### 8.1 Enabling a Module

When a module is "available," users can enable it via a dialog:

```tsx
function EnableModuleDialog({ module_key, workspace }: Props) {
  const module_info = getModuleInfo(module_key);

  return (
    <Dialog>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Enable {module_info.label}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-zinc-600">
            {module_info.description}
          </p>

          <div>
            <p className="text-sm font-medium mb-2">You'll be able to:</p>
            <ul className="space-y-2">
              {module_info.capabilities.map(cap => (
                <li key={cap} className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-emerald-600 mt-0.5" />
                  <span className="text-sm text-zinc-700">{cap}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Maybe Later
          </Button>
          <Button
            onClick={async () => {
              await enableModule(workspace.workspace_id, module_key);
              onOpenChange(false);
            }}
          >
            Enable {module_info.label}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

---

## 9. Usage Pattern Learning

### 9.1 Track Usage

After every user action, log it:

```typescript
interface WorkspaceActivity {
  workspace_id: string;
  user_id: string;
  module: string;
  action: string;
  timestamp: ISO8601;
  metadata?: object;
}

async function logWorkspaceActivity(activity: WorkspaceActivity) {
  await db.table("workspace_activity").insert(activity);
  
  // Recalculate usage scores every 24h (batch job)
  // or on-demand when dashboard loads
}
```

### 9.2 Recalculate Usage Scores

**Hourly or on-demand:**

```typescript
async function recalculateUsageScores(workspace_id: string) {
  // Get last 30 days of activity
  const activities = await db.table("workspace_activity")
    .where("workspace_id", workspace_id)
    .where("timestamp", ">", 30.days.ago());

  const module_usage = {};
  activities.forEach(a => {
    if (!module_usage[a.module]) module_usage[a.module] = 0;
    module_usage[a.module] += 1;
  });

  // Calculate score (0-100)
  const max_usage = Math.max(...Object.values(module_usage));
  Object.entries(module_usage).forEach(([module, count]) => {
    const score = Math.round((count / max_usage) * 100);
    
    await db.table("workspace_profile")
      .where("workspace_id", workspace_id)
      .update({
        [`profile.modules.${module}.usage_score`]: score
      });
  });
}
```

### 9.3 Sidebar Auto-Sort

When dashboard loads, sort navigation based on usage:

```typescript
function buildNavigation(workspace: WorkspaceProfile): NavigationModule[] {
  const modules = /* ... */;

  const active = modules
    .filter(m => m.state === "active")
    .sort((a, b) => {
      // Primary: enabled and usage
      if (b.usage_score !== a.usage_score) {
        return (b.usage_score || 0) - (a.usage_score || 0);
      }
      // Secondary: module order (CRM, Projects, HR, etc.)
      const module_order = ["crm", "projects", "hr", "finance", "inventory"];
      return module_order.indexOf(a.key) - module_order.indexOf(b.key);
    });

  return [...active, ...available];
}
```

---

## 10. Milestone Celebrations

When a real action is completed, celebrate it:

```typescript
interface Milestone {
  id: string;
  trigger: (workspace: WorkspaceProfile) => boolean;
  message: string;
  sub_message: string;
  icon: React.ComponentType;
}

const milestones: Milestone[] = [
  {
    id: "first_team_invited",
    trigger: (ws) => ws.profile.collaboration.members_total > 1 &&
                     ws.profile.quick_wins.find(w => w.id === "invite_team")?.completed,
    message: "✓ First team member invited",
    sub_message: "Your workspace is now collaborative.",
    icon: Users
  },

  {
    id: "first_client_added",
    trigger: (ws) => ws.profile.modules.crm.data_count > 0 &&
                     ws.profile.quick_wins.find(w => w.id === "create_client")?.completed,
    message: "✓ First client added",
    sub_message: "You can now track client work.",
    icon: UserCheck
  },

  {
    id: "first_project_created",
    trigger: (ws) => ws.profile.modules.projects.data_count > 0 &&
                     ws.profile.quick_wins.find(w => w.id === "create_project")?.completed,
    message: "✓ First project created",
    sub_message: "You can now assign work to your team.",
    icon: CheckCircle2
  }
];

function MilestoneToast({ milestone }: Props) {
  return (
    <div className="fixed bottom-4 right-4 flex items-start gap-3 
                    bg-emerald-50 border border-emerald-200 
                    rounded-lg p-4 animate-in fade-in slide-in-from-bottom-2">
      <milestone.icon className="h-5 w-5 text-emerald-600 mt-0.5" />
      <div>
        <p className="font-medium text-emerald-900">
          {milestone.message}
        </p>
        <p className="text-sm text-emerald-800 mt-0.5">
          {milestone.sub_message}
        </p>
      </div>
    </div>
  );
}
```

---

## 11. Responsive Design

### 11.1 Mobile Dashboard

On mobile (< 768px), stack all sections:

```tsx
export function Dashboard({ workspace }: Props) {
  return (
    <div className="space-y-6 p-4 md:p-6">
      <CommandCenter workspace={workspace} />
      <WorkspaceHealth workspace={workspace} />
      <ModuleActivityOrProgress workspace={workspace} />
      <RecentActivityTimeline workspace={workspace} />
    </div>
  );
}
```

**Sidebar becomes collapsible drawer on mobile.**

### 11.2 Tablet Navigation

On tablet (768px - 1024px), keep sidebar but compress width.

### 11.3 Desktop Navigation

On desktop (> 1024px), full sidebar with all details.

---

## 12. Edge Cases & Special Scenarios

### 12.1 Returning User After 7+ Days Away

Show a "catch-up" summary:

```
Welcome back!

You've been away for 7 days.

Here's what happened:

Ahmed added 3 tasks
Sarah completed project: Acme Redesign
2 new invoices created
```

### 12.2 Workspace with No Activity for 14+ Days

Show encouragement instead of pushing:

```
Your workspace is ready whenever you are.

To get started:
• Invite a team member
• Add your first client
• Create a project

No rush—oru is here when you need it.
```

### 12.3 Multi-Module Workspace (Week 2+)

Show department-specific content if HR module enabled:

```
Your Team

Engineering (3 members)
Sales (2 members)
Admin (1 member)

Your Projects

Acme Redesign [████░░] 60%
Internal Dashboard [██░░░░] 20%
Q3 Planning [████████] 80%
```

### 12.4 Admin User vs Regular Employee

Admin sees setup cards + everything.  
Regular employee sees only their modules.

---

## 13. Data Model & API

### 13.1 Workspace Profile Update Sequence

```
User Action (e.g., "Create Client")
    ↓
Log WorkspaceActivity
    ↓
Trigger WorkspaceProfileUpdate:
  - Update module.data_count
  - Update module.last_activity
  - Recalculate usage_score
  - Check recommendations
  - Calculate health_score
  - Detect milestones
    ↓
Update WorkspaceProfile in database
    ↓
Emit WorkspaceUpdatedEvent (for real-time sync)
    ↓
Next dashboard load shows fresh context
```

### 13.2 Required Database Tables

```sql
-- Workspace profiles (updated in real-time or batch)
CREATE TABLE workspace_profiles (
  workspace_id UUID PRIMARY KEY,
  profile JSONB,
  updated_at TIMESTAMP,
  updated_by UUID
);

-- Activity log (immutable, for historical analysis)
CREATE TABLE workspace_activity (
  id BIGSERIAL PRIMARY KEY,
  workspace_id UUID,
  user_id UUID,
  module VARCHAR,
  action VARCHAR,
  timestamp TIMESTAMP,
  metadata JSONB
);

-- Quick wins (tracks completion)
CREATE TABLE workspace_quick_wins (
  id UUID PRIMARY KEY,
  workspace_id UUID,
  quick_win_id VARCHAR,
  completed_at TIMESTAMP,
  completed_by UUID
);

-- Recommendations log (tracks which recommendations were shown/acted on)
CREATE TABLE workspace_recommendations_log (
  id UUID PRIMARY KEY,
  workspace_id UUID,
  recommendation_id VARCHAR,
  shown_at TIMESTAMP,
  acted_at TIMESTAMP,
  action VARCHAR
);
```

---

## 14. Implementation Sequence

### Phase 1: Foundation (Week 1-2)
1. Create `WorkspaceProfile` data model
2. Implement Capability Engine
3. Build Context Engine (basic)
4. Create dashboard layout shell
5. Build CommandCenter component

### Phase 2: Intelligence (Week 3-4)
6. Implement Recommendation Engine
7. Build WorkspaceHealth scoring
8. Add quick wins system
9. Implement module visibility logic
10. Build navigation component

### Phase 3: Experience (Week 5-6)
11. Create empty state components (all modules)
12. Add module activity cards
13. Implement recent activity timeline
14. Build milestone celebration system
15. Add usage pattern tracking

### Phase 4: Refinement (Week 7-8)
16. Implement responsive design
17. Add real-time sync (WebSocket)
18. Polish animations and transitions
19. Add accessibility (ARIA, keyboard nav)
20. Performance optimization

### Phase 5: Launch & Learning (Ongoing)
21. A/B test recommendation ordering
22. Monitor health score accuracy
23. Refine empty state copy
24. Iterate on quick wins timing

---

## 15. Success Metrics

### Dashboard Effectiveness
- [ ] 95%+ of new users complete at least 1 quick win
- [ ] 80%+ complete at least 3 quick wins in first week
- [ ] Average time-to-first-action < 5 minutes

### Module Adoption
- [ ] 70%+ of users enable 2+ modules in first month
- [ ] Module suggestion acceptance rate > 40%
- [ ] Organic module usage growth > manual enables

### Engagement
- [ ] Average engagement score increases from 30 (Day 1) to 70+ (Day 30)
- [ ] 7-day retention > 60%
- [ ] 30-day retention > 40%

### Health Scores
- [ ] New workspace average health score: 40/100
- [ ] Active workspace average: 75+/100
- [ ] Correlation between health score and engagement

---

## 16. Design Decisions Rationale

### Why Workspace Profile Instead of Stages?
- Users don't follow linear paths
- A solo freelancer and 500-person enterprise use different paths
- Profile is data-driven, not assumption-driven
- Scales infinitely

### Why Three Engines?
- Separation of concerns (what can do? what should show? what to recommend?)
- Easy to test and debug independently
- Engines can be upgraded separately

### Why Always Same Dashboard Layout?
- Reduces cognitive load
- Users learn one pattern
- Content changes, not layout
- Feels like a mature product, not "we're guiding you"

### Why Discrete Progress (2/5) Not Percentages?
- Easier to understand
- Humans count better than estimate percentages
- Feels more achievable

### Why Greyed Modules Not Hidden?
- Teaches product capabilities
- Doesn't feel "restricted"
- Available modules are actionable, not passive

### Why Milestones Over Animations?
- Professional, not gamified
- Celebrate real work, not checklist items
- Feel earned, not automatic

---

## 17. Future Enhancements

### 17.1 AI-Powered Insights
- "Most agencies invite teammates before creating projects"
- "You're using CRM more than expected"
- "Consider enabling Finance—3x as many clients have it"

### 17.2 Workspace Comparison
- "You're ahead of 85% of workspaces at Day 7"
- "Healthy workspaces have 4+ team members"

### 17.3 Smart Defaults Generation
- Pre-create departments based on industry
- Pre-create statuses based on business type
- Pre-create roles based on team size

### 17.4 Predictive Recommendations
- ML model predicts next likely action
- Surface it before user thinks of it

---

## 18. Glossary

| Term | Definition |
|------|-----------|
| **Workspace** | A single agency/organization's data container |
| **Module** | A feature area (CRM, Projects, HR, etc.) |
| **Capability** | Something the workspace can do (enabled + configured) |
| **Recommendation** | A suggested action or insight |
| **Quick Win** | A small, achievable task that builds momentum |
| **Health Score** | Overall workspace readiness (0-100) |
| **Usage Score** | How often a module is used (0-100) |
| **Engagement Score** | Overall workspace activity level (0-100) |
| **Stage** | Workspace maturity level (initializing → scaling) |
| **Milestone** | A real action completed worth celebrating |

---

**Spec Version:** 1.0  
**Status:** Ready for Implementation  
**Next Step:** Invoke writing-plans skill to generate implementation plan
