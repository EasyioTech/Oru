import React from 'react';
import { Download, Plus, Calendar, BarChart3, FileText, DollarSign, Users, Briefcase } from 'lucide-react';

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  category: 'Financial' | 'HR' | 'Project' | 'Custom';
  report_type: 'financial' | 'attendance' | 'payroll' | 'leave' | 'employee' | 'project' | 'gst' | 'custom';
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  route?: string;
}

export const REPORT_TEMPLATES: ReportTemplate[] = [
  {
    id: 'balance-sheet',
    name: 'Balance Sheet',
    description: 'Assets, liabilities, and equity statement',
    category: 'Financial',
    report_type: 'financial',
    icon: FileText,
    color: 'blue',
    route: '/financial-management'
  },
  {
    id: 'profit-loss',
    name: 'Profit & Loss',
    description: 'Income and expenses statement',
    category: 'Financial',
    report_type: 'financial',
    icon: BarChart3,
    color: 'green',
    route: '/financial-management'
  },
  {
    id: 'cash-flow',
    name: 'Cash Flow Statement',
    description: 'Cash receipts and payments',
    category: 'Financial',
    report_type: 'financial',
    icon: DollarSign,
    color: 'purple',
    route: '/financial-management'
  },
  {
    id: 'job-profitability',
    name: 'Job Profitability',
    description: 'Job cost analysis and margins',
    category: 'Financial',
    report_type: 'financial',
    icon: Briefcase,
    color: 'orange',
    route: '/jobs'
  },
  {
    id: 'attendance-summary',
    name: 'Employee Attendance Summary',
    description: 'Monthly attendance tracking',
    category: 'HR',
    report_type: 'attendance',
    icon: Users,
    color: 'indigo',
    route: '/attendance'
  },
  {
    id: 'payroll-summary',
    name: 'Payroll Summary',
    description: 'Salary and compensation overview',
    category: 'HR',
    report_type: 'payroll',
    icon: DollarSign,
    color: 'pink',
    route: '/payroll'
  },
  {
    id: 'leave-report',
    name: 'Leave Report',
    description: 'Leave requests and balances',
    category: 'HR',
    report_type: 'leave',
    icon: Calendar,
    color: 'teal',
    route: '/leave-requests'
  },
  {
    id: 'employee-performance',
    name: 'Employee Performance',
    description: 'Performance metrics and reviews',
    category: 'HR',
    report_type: 'employee',
    icon: BarChart3,
    color: 'cyan',
    route: '/employee-management'
  },
  {
    id: 'project-status',
    name: 'Project Status Overview',
    description: 'Current status of all projects',
    category: 'Project',
    report_type: 'project',
    icon: Briefcase,
    color: 'violet',
    route: '/projects'
  },
  {
    id: 'resource-utilization',
    name: 'Resource Utilization',
    description: 'Team and resource allocation',
    category: 'Project',
    report_type: 'project',
    icon: Users,
    color: 'amber',
    route: '/projects'
  },
  {
    id: 'budget-vs-actual',
    name: 'Budget vs Actual',
    description: 'Project budget performance',
    category: 'Project',
    report_type: 'project',
    icon: DollarSign,
    color: 'emerald',
    route: '/projects'
  }
];
