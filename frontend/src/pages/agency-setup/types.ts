export interface AgencySetupFormData {
  companyName: string;
  companyTagline: string;
  industry: string;
  businessType: string;
  foundedYear: string;
  employeeCount: string;
  logo: File | null;
  description: string;

  legalName: string;
  registrationNumber: string;
  taxId: string;
  taxIdType: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  phone: string;
  email: string;
  website: string;
  socialMedia: {
    linkedin: string;
    twitter: string;
    facebook: string;
  };

  departments: Array<{ id: string; name: string; description: string; manager: string; budget: string }>;

  currency: string;
  fiscalYearStart: string;
  paymentTerms: string;
  invoicePrefix: string;
  taxRate: string;
  enableGST: boolean;
  gstNumber: string;
  bankDetails: {
    accountName: string;
    accountNumber: string;
    bankName: string;
    routingNumber: string;
    swiftCode: string;
  };

  teamMembers: Array<{
    name: string;
    email: string;
    role: string;
    department: string;
    phone: string;
    title: string;
  }>;

  timezone: string;
  dateFormat: string;
  timeFormat: string;
  weekStart: string;
  language: string;
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
    weeklyReport: boolean;
    monthlyReport: boolean;
  };
  features: {
    enablePayroll: boolean;
    enableProjects: boolean;
    enableCRM: boolean;
    enableInventory: boolean;
    enableReports: boolean;
  };
}

export const initialFormData: AgencySetupFormData = {
  companyName: '',
  companyTagline: '',
  industry: '',
  businessType: '',
  foundedYear: '',
  employeeCount: '',
  logo: null,
  description: '',

  legalName: '',
  registrationNumber: '',
  taxId: '',
  taxIdType: 'EIN',
  address: {
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
  },
  phone: '',
  email: '',
  website: '',
  socialMedia: {
    linkedin: '',
    twitter: '',
    facebook: '',
  },

  departments: [],

  currency: 'USD',
  fiscalYearStart: '01-01',
  paymentTerms: '30',
  invoicePrefix: 'INV',
  taxRate: '0',
  enableGST: false,
  gstNumber: '',
  bankDetails: {
    accountName: '',
    accountNumber: '',
    bankName: '',
    routingNumber: '',
    swiftCode: '',
  },

  teamMembers: [],

  timezone: 'America/New_York',
  dateFormat: 'MM/DD/YYYY',
  timeFormat: '12',
  weekStart: 'Monday',
  language: 'en',
  notifications: {
    email: true,
    sms: false,
    push: true,
    weeklyReport: true,
    monthlyReport: true,
  },
  features: {
    enablePayroll: true,
    enableProjects: true,
    enableCRM: true,
    enableInventory: false,
    enableReports: true,
  },
};
