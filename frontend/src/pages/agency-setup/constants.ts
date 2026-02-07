import {
  Building2,
  FileText,
  Briefcase,
  DollarSign,
  Users,
  Settings,
  CheckCircle2,
  LucideIcon,
} from 'lucide-react';

export const SETUP_STEPS: Array<{ id: number; title: string; icon: LucideIcon; description: string }> = [
  { id: 1, title: 'Company Profile', icon: Building2, description: 'Basic company information and branding' },
  { id: 2, title: 'Business Details', icon: FileText, description: 'Legal and tax information' },
  { id: 3, title: 'Departments', icon: Briefcase, description: 'Organizational structure' },
  { id: 4, title: 'Financial Setup', icon: DollarSign, description: 'Currency, payment, and billing' },
  { id: 5, title: 'Team Members', icon: Users, description: 'Add your team' },
  { id: 6, title: 'Preferences', icon: Settings, description: 'System preferences' },
  { id: 7, title: 'Review', icon: CheckCircle2, description: 'Review and complete' },
];

export const CURRENCIES = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
];

export const TIMEZONES = [
  { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'America/Toronto', label: 'Eastern Time - Toronto' },
  { value: 'Europe/London', label: 'Greenwich Mean Time (GMT)' },
  { value: 'Europe/Paris', label: 'Central European Time (CET)' },
  { value: 'Asia/Dubai', label: 'Gulf Standard Time (GST)' },
  { value: 'Asia/Kolkata', label: 'India Standard Time (IST)' },
  { value: 'Asia/Singapore', label: 'Singapore Time (SGT)' },
  { value: 'Asia/Tokyo', label: 'Japan Standard Time (JST)' },
  { value: 'Australia/Sydney', label: 'Australian Eastern Time (AET)' },
];

export const DATE_FORMATS = [
  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY (US Format)' },
  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY (European Format)' },
  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (ISO Format)' },
  { value: 'DD-MM-YYYY', label: 'DD-MM-YYYY (Alternative)' },
];

export const BUSINESS_TYPES = [
  'Corporation',
  'LLC',
  'Partnership',
  'Sole Proprietorship',
  'Non-Profit',
  'Government',
  'Other',
];

export const INDUSTRY_OPTIONS = [
  'Technology',
  'Healthcare',
  'Finance',
  'Manufacturing',
  'Retail',
  'Construction',
  'Real Estate',
  'Education',
  'Consulting',
  'Legal',
  'Marketing',
  'Hospitality',
  'Transportation',
  'Energy',
  'Other',
];
