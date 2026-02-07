import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { ArrowLeft, CalendarIcon, Save, User, Mail, Phone, Building, MapPin, Upload, X, Sparkles } from "lucide-react";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { db } from '@/lib/database';
import { useToast } from "@/hooks/use-toast";
import { generateUUID, isValidUUID } from '@/lib/uuid';
import { useAuth } from "@/hooks/useAuth";
import { selectOne, selectRecords, executeTransaction, buildInsertStatement } from '@/services/api/core';
import { getAgencyId } from '@/utils/agencyUtils';
import bcrypt from '@/lib/bcrypt';
import { logError, logWarn } from '@/utils/consoleLogger';
import { CredentialsSuccessCard, EmergencyContactSection, DocumentUploadSection, type UploadedFile } from './components';

const formSchema = z.object({
  // Personal Information
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Please enter a valid work email address"),
  personalEmail: z.string().optional().refine(val => !val || val.trim() === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val), { message: "Enter a valid email" }),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  dateOfBirth: z.date({
    required_error: "Date of birth is required",
  }),
  panCardNumber: z.string().optional().refine(
    (val) => !val || val.length === 0 || (val.length === 10 && /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(val)),
    { message: "PAN must be 10 characters, e.g. ABCDE1234F" }
  ),
  nationality: z.string().min(2, "Nationality is required"),
  maritalStatus: z.enum(["single", "married", "divorced", "widowed"]),
  
  // Employment Details
  employeeId: z.string().optional(), // Auto-generated, optional in form
  position: z.string().min(2, "Position is required"),
  department: z.string().min(1, "Department is required"),
  role: z.string().min(1, "Role is required"), // Dynamic based on database
  hireDate: z.date({
    required_error: "Hire date is required",
  }),
  salary: z.string().min(1, "Salary is required").refine(
    (s) => { const n = parseFloat(s); return !Number.isNaN(n) && n > 0; },
    { message: "Salary must be a positive number" }
  ),
  employmentType: z.string().min(1, "Employment type is required"), // Dynamic based on database
  workLocation: z.string().min(2, "Work location is required"),
  supervisor: z.string().optional().refine(
    (val) => {
      if (!val || !val.trim()) return true; // Empty is allowed
      // UUID v4 format validation
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      return uuidRegex.test(val.trim());
    },
    { message: "Supervisor must be a valid UUID format" }
  ),
  
  // Emergency Contact
  emergencyContactName: z.string().min(2, "Emergency contact name is required"),
  emergencyContactPhone: z.string().min(10, "Emergency contact phone is required"),
  emergencyContactRelationship: z.string().min(2, "Relationship is required"),
  
  // Additional Info
  notes: z.string().optional(),
});

interface Department {
  id: string;
  name: string;
}

const CreateEmployee = () => {
  const { toast } = useToast();
  const { user, profile } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);
  const [generatedEmployeeId, setGeneratedEmployeeId] = useState<string>('');
  const [dateOfBirthOpen, setDateOfBirthOpen] = useState(false);
  const [hireDateOpen, setHireDateOpen] = useState(false);
  const [dateOfBirthInput, setDateOfBirthInput] = useState<string>('');
  const [hireDateInput, setHireDateInput] = useState<string>('');
  const [companyName, setCompanyName] = useState<string>('');
  const [companyDomain, setCompanyDomain] = useState<string>('company.com');
  const [createdCredentials, setCreatedCredentials] = useState<{ loginUrl: string; email: string; password: string; personalEmail?: string; companyName: string } | null>(null);
  const [copiedCreds, setCopiedCreds] = useState(false);

  // State for database-fetched options
  const [departments, setDepartments] = useState<Department[]>([]);
  const [roles, setRoles] = useState<string[]>([]);
  const [employmentTypes, setEmploymentTypes] = useState<string[]>([]);
  const [positions, setPositions] = useState<string[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      personalEmail: "",
      phone: "",
      address: "",
      panCardNumber: "",
      nationality: "",
      maritalStatus: "single",
      employeeId: "",
      position: "",
      department: "",
      role: "employee",
      salary: "",
      employmentType: "full-time",
      workLocation: "",
      supervisor: "",
      emergencyContactName: "",
      emergencyContactPhone: "",
      emergencyContactRelationship: "",
      notes: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      const currentUserId = user?.id;
      if (!currentUserId) {
        throw new Error('You must be logged in to create an employee');
      }

      const agencyId = await getAgencyId(profile, user?.id);
      if (!agencyId) {
        throw new Error('Agency ID not found. Please ensure you are logged in to an agency account.');
      }

      // Pre-flight: reject duplicate email (no auto-cleanup to avoid partial state and race conditions)
      const emailNorm = values.email.toLowerCase().trim();
      const existingUser = await selectOne('users', { email: emailNorm });
      if (existingUser) {
        const hasEmployeeDetails = await selectOne('employee_details', { user_id: existingUser.id });
        throw new Error(
          hasEmployeeDetails
            ? `A user with email "${values.email}" already exists. Please use a different email address.`
            : `Email "${values.email}" is already in use or has an incomplete record. Use a different email or contact support.`
        );
      }

      // Pre-flight: validate department exists if provided
      let selectedDepartmentId: string | null = null;
      let selectedDepartmentName: string | null = null;
      if (values.department?.trim() && values.department !== '__no_departments__') {
        const departmentRecord = await selectOne<Department>('departments', { id: values.department });
        if (!departmentRecord) {
          throw new Error('Selected department is invalid. Please choose a valid department.');
        }
        selectedDepartmentId = departmentRecord.id;
        selectedDepartmentName = departmentRecord.name;
      }

      // Pre-flight: role must be valid (reject invalid instead of defaulting)
      const validRoles = [
        'super_admin', 'ceo', 'cto', 'cfo', 'coo', 'admin',
        'operations_manager', 'department_head', 'team_lead',
        'project_manager', 'hr', 'finance_manager', 'sales_manager',
        'marketing_manager', 'quality_assurance', 'it_support',
        'legal_counsel', 'business_analyst', 'customer_success',
        'employee', 'contractor', 'intern'
      ];
      const normalizedRole = values.role?.replace(/-/g, '_').toLowerCase();
      if (!normalizedRole || !validRoles.includes(normalizedRole)) {
        throw new Error('Please select a valid role from the dropdown.');
      }

      // Pre-flight: salary must be positive (Zod already validates; double-check)
      const salaryValue = parseFloat(values.salary);
      if (Number.isNaN(salaryValue) || salaryValue <= 0) {
        throw new Error('Salary must be a positive number.');
      }

      const userId = generateUUID();
      const tempPassword = 'TempPass' + Math.random().toString(36).substring(2, 10) + '!';
      const passwordHash = await bcrypt.hash(tempPassword, 10);

      // Generate unique employee_id before transaction
      let employeeId = values.employeeId?.trim() || '';
      if (!employeeId) {
        const latestEmployees = await selectRecords('employee_details', {
          where: { agency_id: agencyId },
          orderBy: 'created_at DESC',
          limit: 1
        });
        if (latestEmployees.length > 0 && latestEmployees[0].employee_id?.match(/(\d+)$/)) {
          const nextNum = parseInt((latestEmployees[0].employee_id as string).match(/(\d+)$/)![1]) + 1;
          employeeId = `EMP-${String(nextNum).padStart(4, '0')}`;
        } else {
          employeeId = 'EMP-0001';
        }
      }
      const existingEmp = await selectOne('employee_details', { employee_id: employeeId });
      if (existingEmp) {
        employeeId = `EMP-${Date.now().toString().slice(-6)}`;
        const again = await selectOne('employee_details', { employee_id: employeeId });
        if (again) employeeId = `EMP-${generateUUID().substring(0, 8).toUpperCase()}`;
      }

      let supervisorId: string | null = null;
      if (values.supervisor?.trim() && isValidUUID(values.supervisor.trim())) {
        supervisorId = values.supervisor.trim();
      }

      // Optional: upload avatar before transaction (non-blocking; no user created yet)
      let avatarUrl: string | null = null;
      if (profileImage) {
        try {
          const fileExt = profileImage.name.split('.').pop() || 'jpg';
          const pathWithinBucket = `${userId}_${Date.now()}.${fileExt}`;
          const { uploadFile } = await import('@/services/api/storage');
          const fileBuffer = await profileImage.arrayBuffer();
          await uploadFile('avatars', pathWithinBucket, fileBuffer, currentUserId, profileImage.type);
          const { getApiRoot } = await import('@/config/api');
          avatarUrl = `${getApiRoot().replace(/\/$/, '')}/files/avatars/${encodeURIComponent(pathWithinBucket)}`;
        } catch (uploadErr: unknown) {
          logError('Profile photo upload failed:', uploadErr);
          toast({ title: 'Photo skipped', description: 'Avatar upload failed; employee will be created without photo.', variant: 'default' });
        }
      }

      const profileId = generateUUID();
      const employeeDetailsId = generateUUID();
      const salaryDetailsId = generateUUID();
      const userRoleId = generateUUID();
      const personalEmailVal = (values.personalEmail as string)?.trim() || null;

      const hireDateStr = values.hireDate.toISOString().split('T')[0];
      const dobStr = values.dateOfBirth.toISOString().split('T')[0];

      // Single transaction: all-or-nothing (no partial users)
      // IMPORTANT: Do NOT await client.query() - we must collect ALL queries before the
      // transaction sends them. Awaiting would suspend after the first query and only
      // the users insert would be sent, causing "employee with email but no details".
      await executeTransaction((client) => {
        const { sql: usersSql, params: usersParams } = buildInsertStatement('users', {
          id: userId,
          email: emailNorm,
          password_hash: passwordHash,
          is_active: true,
          email_confirmed: true,
        });
        client.query(usersSql, usersParams);

        const profileRow: Record<string, unknown> = {
          id: profileId,
          user_id: userId,
          agency_id: agencyId,
          full_name: `${values.firstName} ${values.lastName}`,
          phone: values.phone,
          department: selectedDepartmentName,
          position: values.position,
          hire_date: hireDateStr,
          is_active: true,
        };
        if (avatarUrl) profileRow.avatar_url = avatarUrl;
        if (personalEmailVal) profileRow.personal_email = personalEmailVal;
        const { sql: profilesSql, params: profilesParams } = buildInsertStatement('profiles', profileRow as Record<string, any>);
        client.query(profilesSql, profilesParams);

        const { sql: edSql, params: edParams } = buildInsertStatement('employee_details', {
          id: employeeDetailsId,
          user_id: userId,
          employee_id: employeeId,
          created_by: currentUserId,
          first_name: values.firstName,
          last_name: values.lastName,
          date_of_birth: dobStr,
          social_security_number: values.panCardNumber?.trim() || null,
          nationality: values.nationality,
          marital_status: values.maritalStatus,
          address: values.address,
          employment_type: values.employmentType,
          work_location: values.workLocation,
          supervisor_id: supervisorId,
          emergency_contact_name: values.emergencyContactName,
          emergency_contact_phone: values.emergencyContactPhone,
          emergency_contact_relationship: values.emergencyContactRelationship,
          notes: values.notes ?? null,
          agency_id: agencyId,
          is_active: true,
        });
        client.query(edSql, edParams);

        const { sql: salSql, params: salParams } = buildInsertStatement('employee_salary_details', {
          id: salaryDetailsId,
          employee_id: employeeDetailsId,
          agency_id: agencyId,
          base_salary: salaryValue,
          salary: salaryValue,
          currency: 'USD',
          salary_frequency: 'monthly',
          pay_frequency: 'monthly',
          effective_date: hireDateStr,
        });
        client.query(salSql, salParams);

        const { sql: urSql, params: urParams } = buildInsertStatement('user_roles', {
          id: userRoleId,
          user_id: userId,
          role: normalizedRole,
          agency_id: agencyId,
        });
        client.query(urSql, urParams);

        if (selectedDepartmentId) {
          const { sql: taSql, params: taParams } = buildInsertStatement('team_assignments', {
            id: generateUUID(),
            user_id: userId,
            department_id: selectedDepartmentId,
            position_title: values.position,
            role_in_department: values.role,
            start_date: hireDateStr,
            is_active: true,
            agency_id: agencyId,
            assigned_by: currentUserId,
          });
          client.query(taSql, taParams);
        }
        return Promise.resolve();
      });

      const loginUrl = typeof window !== 'undefined' ? `${window.location.origin}/auth` : '';
      setCreatedCredentials({
        loginUrl,
        email: emailNorm,
        password: tempPassword,
        personalEmail: personalEmailVal || undefined,
        companyName: companyName || 'Company',
      });
      toast({
        title: 'Employee created',
        description: "Copy or download the login details and send them to the employee's personal email.",
      });
      setUploadedFiles([]);
      setProfileImage(null);
      setProfileImagePreview(null);
    } catch (error) {
      logError("Error creating employee:", error);
      
      // Handle specific database errors
      let errorMessage = "Error creating employee. Please try again.";
      
      if (error instanceof Error) {
        const errorStr = error.message || error.toString();
        
        // Check for duplicate email constraint
        if (errorStr.includes('duplicate key value violates unique constraint "users_email_key"') ||
            errorStr.includes('already exists') ||
            errorStr.includes('23505')) {
          errorMessage = `A user with email "${values.email}" already exists. Please use a different email address.`;
        } 
        // Check for invalid enum value
        else if (errorStr.includes('invalid input value for enum app_role') ||
                 errorStr.includes('22P02')) {
          errorMessage = `Invalid role selected: "${values.role}". Please select a valid role from the dropdown.`;
        }
        // Check for duplicate employee_id constraint
        else if (errorStr.includes('duplicate key value violates unique constraint') && 
                 errorStr.includes('employee_id')) {
          errorMessage = `Employee ID "${values.employeeId}" already exists. Please use a different employee ID.`;
        }
        // Use the error message if it's already user-friendly
        else if (error.message && !error.message.includes('Database API error')) {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, category: string) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const newFile: UploadedFile = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        name: file.name,
        size: file.size,
        type: file.type,
        category,
        file
      };
      setUploadedFiles(prev => [...prev, newFile]);
    });
  };

  const handleProfileImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setProfileImage(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setProfileImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
  };

  const removeProfileImage = () => {
    setProfileImage(null);
    setProfileImagePreview(null);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Helper function to format date input with auto-formatting (DD/MM/YYYY - Indian Standard)
  const formatDateInput = (value: string): string => {
    // Remove all non-digit characters
    const digits = value.replace(/\D/g, '');
    
    // Limit to 8 digits (DDMMYYYY)
    const limitedDigits = digits.slice(0, 8);
    
    // Format with slashes
    if (limitedDigits.length <= 2) {
      return limitedDigits;
    } else if (limitedDigits.length <= 4) {
      return `${limitedDigits.slice(0, 2)}/${limitedDigits.slice(2)}`;
    } else {
      return `${limitedDigits.slice(0, 2)}/${limitedDigits.slice(2, 4)}/${limitedDigits.slice(4)}`;
    }
  };

  // Helper function to parse DD/MM/YYYY format (Indian Standard)
  const parseIndianDate = (dateStr: string): Date | null => {
    if (!dateStr.trim()) return null;
    
    // Remove slashes and get only digits
    const digits = dateStr.replace(/\D/g, '');
    
    // Need at least 6 digits (DDMMYY) or 8 digits (DDMMYYYY)
    if (digits.length < 6) return null;
    
    // Extract day, month, year
    const day = parseInt(digits.slice(0, 2));
    const month = parseInt(digits.slice(2, 4));
    let year = parseInt(digits.slice(4));
    
    // Handle 2-digit year (assume 2000s if < 50, 1900s if >= 50)
    if (year < 100) {
      year = year < 50 ? 2000 + year : 1900 + year;
    }
    
    // Validate day, month, year
    if (day < 1 || day > 31 || month < 1 || month > 12 || year < 1900 || year > 2100) {
      return null;
    }
    
    // Create date object (month is 0-indexed in JavaScript Date)
    const date = new Date(year, month - 1, day);
    
    // Validate the date (check if it's a valid date)
    if (date.getDate() !== day || date.getMonth() !== month - 1 || date.getFullYear() !== year) {
      return null;
    }
    
    return date;
  };

  // Fetch departments from database
  // Note: In isolated database architecture, all records in this DB belong to the agency
  // No need to filter by agency_id - just get all active departments
  const fetchDepartments = async () => {
    try {
      const deptData = await selectRecords('departments', {
        select: 'id, name',
        filters: [
          { column: 'is_active', operator: 'eq', value: true }
        ],
        orderBy: 'name ASC'
      });
      
      setDepartments(deptData || []);
    } catch (error) {
      logError('Error fetching departments:', error);
      toast({
        title: "Warning",
        description: "Failed to load departments. Please refresh the page.",
        variant: "destructive",
      });
    }
  };

  // Fetch distinct roles from user_roles table
  const fetchRoles = async () => {
    try {
      const agencyId = await getAgencyId(profile, user?.id);
      if (!agencyId) {
        logWarn('No agency_id available for fetching roles');
        return;
      }

      // Valid enum values for app_role (must match database enum)
      const validRoles = [
        'super_admin', 'ceo', 'cto', 'cfo', 'coo', 'admin', 
        'operations_manager', 'department_head', 'team_lead', 
        'project_manager', 'hr', 'finance_manager', 'sales_manager',
        'marketing_manager', 'quality_assurance', 'it_support', 
        'legal_counsel', 'business_analyst', 'customer_success',
        'employee', 'contractor', 'intern'
      ];

      // Fetch distinct roles from user_roles filtered by agency
      const rolesData = await selectRecords('user_roles', {
        select: 'role',
        filters: [
          { column: 'agency_id', operator: 'eq', value: agencyId }
        ]
      });

      // Get unique roles and filter to only valid enum values
      const uniqueRoles = Array.from(new Set((rolesData || []).map((r: any) => r.role).filter(Boolean)));
      const validUniqueRoles = uniqueRoles.filter((role: string) => validRoles.includes(role.toLowerCase()));
      
      // If no valid roles found, use default valid roles
      if (validUniqueRoles.length === 0) {
        setRoles(['employee', 'hr', 'finance_manager', 'admin', 'super_admin']);
      } else {
        // Always include common roles even if not in database yet
        const defaultRoles = ['employee', 'hr', 'admin'];
        const combinedRoles = Array.from(new Set([...defaultRoles, ...validUniqueRoles]));
        setRoles(combinedRoles.sort());
      }
    } catch (error) {
      logError('Error fetching roles:', error);
      // Fallback to default valid roles
      setRoles(['employee', 'hr', 'finance_manager', 'admin', 'super_admin']);
    }
  };

  // Fetch distinct employment types from employee_details
  const fetchEmploymentTypes = async () => {
    try {
      const agencyId = await getAgencyId(profile, user?.id);
      if (!agencyId) {
        logWarn('No agency_id available for fetching employment types');
        return;
      }

      // Fetch distinct employment types from employee_details
      const empData = await selectRecords('employee_details', {
        select: 'employment_type',
        filters: [
          { column: 'agency_id', operator: 'eq', value: agencyId }
        ]
      });

      // Get unique employment types
      const uniqueTypes = Array.from(new Set((empData || []).map((e: any) => e.employment_type).filter(Boolean)));
      
      // If no types found or empty, use default types
      if (uniqueTypes.length === 0) {
        setEmploymentTypes(['full-time', 'part-time', 'contract', 'intern']);
      } else {
        // Normalize the values (handle both 'full-time' and 'full_time')
        const normalizedTypes = uniqueTypes.map((t: string) => {
          if (t === 'full_time') return 'full-time';
          if (t === 'part_time') return 'part-time';
          return t;
        });
        setEmploymentTypes(Array.from(new Set(normalizedTypes)).sort());
      }
    } catch (error) {
      logError('Error fetching employment types:', error);
      // Fallback to default types
      setEmploymentTypes(['full-time', 'part-time', 'contract', 'intern']);
    }
  };

  // Fetch distinct positions from profiles
  const fetchPositions = async () => {
    try {
      const agencyId = await getAgencyId(profile, user?.id);
      if (!agencyId) {
        logWarn('No agency_id available for fetching positions');
        return;
      }

      // Fetch distinct positions from profiles
      const profilesData = await selectRecords('profiles', {
        select: 'position',
        filters: [
          { column: 'agency_id', operator: 'eq', value: agencyId },
          { column: 'position', operator: 'is not', value: null }
        ]
      });

      // Get unique positions
      const uniquePositions = Array.from(new Set((profilesData || []).map((p: any) => p.position).filter(Boolean)));
      setPositions(uniquePositions.sort());
    } catch (error) {
      logError('Error fetching positions:', error);
      // Positions can be empty - it's optional to have existing positions
      setPositions([]);
    }
  };

  // Load company name/domain for auto-email
  useEffect(() => {
    const loadAgencySettings = async () => {
      try {
        const settings = await selectOne<{ agency_name?: string; domain?: string }>('agency_settings', {});
        if (settings?.agency_name) {
          setCompanyName(settings.agency_name);
          const slug = settings.agency_name.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '');
          setCompanyDomain(settings.domain && settings.domain.includes('@') ? settings.domain.split('@')[1] : (slug ? `${slug}.com` : 'company.com'));
        }
      } catch {
        setCompanyDomain('company.com');
      }
    };
    loadAgencySettings();
  }, []);

  // Generate work email from first name, last name, and company domain
  const generateWorkEmail = () => {
    const first = form.getValues('firstName')?.trim().toLowerCase().replace(/\s+/g, '.') || '';
    const last = form.getValues('lastName')?.trim().toLowerCase().replace(/\s+/g, '.') || '';
    if (!first || !last) {
      toast({ title: "Enter name first", description: "Fill first and last name to generate email.", variant: "default" });
      return;
    }
    const base = `${first}.${last}`;
    const domain = companyDomain || 'company.com';
    const suggested = `${base}@${domain}`;
    form.setValue('email', suggested);
    toast({ title: "Email generated", description: `Use ${suggested} or edit as needed.` });
  };

  // Load all options on component mount
  useEffect(() => {
    const loadAllOptions = async () => {
      setLoadingOptions(true);
      try {
        await Promise.all([
          fetchDepartments(),
          fetchRoles(),
          fetchEmploymentTypes(),
          fetchPositions()
        ]);
      } catch (error) {
        logError('Error loading options:', error);
      } finally {
        setLoadingOptions(false);
      }
    };

    loadAllOptions();
  }, [profile, user]);

  // Generate employee ID on component mount
  useEffect(() => {
    const generateInitialEmployeeId = async () => {
      try {
        const latestEmployees = await selectRecords('employee_details', {
          select: 'employee_id',
          orderBy: 'created_at DESC',
          limit: 1
        });
        
        if (latestEmployees.length > 0 && latestEmployees[0].employee_id) {
          const match = latestEmployees[0].employee_id.match(/(\d+)$/);
          if (match) {
            const nextNum = parseInt(match[1]) + 1;
            const newId = `EMP-${String(nextNum).padStart(4, '0')}`;
            setGeneratedEmployeeId(newId);
            form.setValue('employeeId', newId);
          } else {
            setGeneratedEmployeeId('EMP-0001');
            form.setValue('employeeId', 'EMP-0001');
          }
        } else {
          setGeneratedEmployeeId('EMP-0001');
          form.setValue('employeeId', 'EMP-0001');
        }
      } catch (error) {
        logError('Error generating employee ID:', error);
        // Fallback to default
        setGeneratedEmployeeId('EMP-0001');
        form.setValue('employeeId', 'EMP-0001');
      }
    };
    
    generateInitialEmployeeId();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const credentialsText = createdCredentials
    ? [
        `${createdCredentials.companyName} – Employee login details`,
        '',
        'Login URL: ' + createdCredentials.loginUrl,
        'Work email: ' + createdCredentials.email,
        'Temporary password: ' + createdCredentials.password,
        '',
        'Please change your password after first login.',
        createdCredentials.personalEmail ? `Send this to the employee's personal email: ${createdCredentials.personalEmail}` : '',
      ].filter(Boolean).join('\n')
    : '';

  const copyCredentials = async () => {
    try {
      await navigator.clipboard.writeText(credentialsText);
      setCopiedCreds(true);
      toast({ title: "Copied", description: "Login details copied to clipboard." });
      setTimeout(() => setCopiedCreds(false), 2000);
    } catch {
      toast({ title: "Copy failed", description: "Could not copy to clipboard.", variant: "destructive" });
    }
  };

  const downloadCredentials = () => {
    if (!createdCredentials) return;
    const blob = new Blob([credentialsText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `login-details-${createdCredentials.email.replace('@', '-at-')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Downloaded", description: "Login details saved as file." });
  };

  const dismissCredentials = () => {
    setCreatedCredentials(null);
    const currentEmployeeId = form.getValues('employeeId') || generatedEmployeeId || '';
    form.reset({
      firstName: "",
      lastName: "",
      email: "",
      personalEmail: "",
      phone: "",
      address: "",
      panCardNumber: "",
      nationality: "",
      maritalStatus: "single",
      employeeId: currentEmployeeId,
      position: "",
      department: "",
      role: "employee",
      salary: "",
      employmentType: "full-time",
      workLocation: "",
      supervisor: "",
      emergencyContactName: "",
      emergencyContactPhone: "",
      emergencyContactRelationship: "",
      notes: "",
    });
    form.setValue('dateOfBirth', undefined as any);
    form.setValue('hireDate', undefined as any);
    setDateOfBirthInput('');
    setHireDateInput('');
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0 mb-6">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl lg:text-3xl font-bold break-words">Create New Employee</h1>
          <p className="text-sm lg:text-base text-muted-foreground">Add a new employee to the system</p>
        </div>
        <Button asChild variant="outline" size="sm" className="w-full lg:w-auto h-10">
          <Link to="/employee-management">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Employees
          </Link>
        </Button>
      </div>

      {createdCredentials && (
        <CredentialsSuccessCard
          credentialsText={credentialsText}
          copiedCreds={copiedCreds}
          onCopy={copyCredentials}
          onDownload={downloadCredentials}
          onDismiss={dismissCredentials}
          personalEmail={createdCredentials.personalEmail}
        />
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Profile Image Upload */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Profile Photo
                  </CardTitle>
                  <CardDescription>Upload employee profile picture</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-6">
                    <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center overflow-hidden">
                      {profileImagePreview ? (
                        <img 
                          src={profileImagePreview} 
                          alt="Profile preview" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="h-8 w-8 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex flex-col space-y-2">
                      <Label htmlFor="profile-image" className="cursor-pointer">
                        <div className="flex items-center space-x-2 px-4 py-2 border border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors">
                          <Upload className="h-4 w-4" />
                          <span className="text-sm">Upload Photo</span>
                        </div>
                      </Label>
                      <Input
                        id="profile-image"
                        type="file"
                        accept="image/*"
                        onChange={handleProfileImageUpload}
                        className="hidden"
                      />
                      {profileImage && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={removeProfileImage}
                        >
                          <X className="h-3 w-3 mr-1" />
                          Remove
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Personal Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Personal Information
                  </CardTitle>
                  <CardDescription>Basic employee details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name</FormLabel>
                          <FormControl>
                            <Input placeholder="John" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Doe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Work email (login)</FormLabel>
                        <FormControl>
                          <div className="flex gap-2">
                            <div className="relative flex-1">
                              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input placeholder="john.doe@company.com" className="pl-10" {...field} />
                            </div>
                            <Button type="button" variant="outline" size="sm" onClick={generateWorkEmail} className="shrink-0">
                              <Sparkles className="h-4 w-4 mr-1" />
                              Generate
                            </Button>
                          </div>
                        </FormControl>
                        <p className="text-xs text-muted-foreground">Generated as firstname.lastname@{companyDomain || 'company.com'}</p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="personalEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Personal email (optional)</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Send login details to this email" className="pl-10" {...field} />
                          </div>
                        </FormControl>
                        <p className="text-xs text-muted-foreground">Credentials will not be sent automatically; copy or download below and send to this address.</p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="+1 (555) 123-4567" className="pl-10" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="dateOfBirth"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Date of Birth</FormLabel>
                          <Popover open={dateOfBirthOpen} onOpenChange={setDateOfBirthOpen}>
                              <FormControl>
                                <div className="relative">
                                  <Input
                                    placeholder="DD/MM/YYYY (e.g., 09/05/2007)"
                                    value={dateOfBirthInput || (field.value ? format(field.value, "dd/MM/yyyy") : "")}
                                    onChange={(e) => {
                                      const inputValue = e.target.value;
                                      
                                      // Format the input with auto-slash insertion
                                      const formatted = formatDateInput(inputValue);
                                      
                                      // Update local state for display
                                      setDateOfBirthInput(formatted);
                                      
                                      // Try to parse the date (DD/MM/YYYY format - Indian Standard)
                                      const parsedDate = parseIndianDate(formatted);
                                      
                                      if (parsedDate && !isNaN(parsedDate.getTime())) {
                                        const today = new Date();
                                        today.setHours(23, 59, 59, 999);
                                        const minDate = new Date("1900-01-01");
                                        
                                        if (parsedDate <= today && parsedDate >= minDate) {
                                          field.onChange(parsedDate);
                                        }
                                      } else if (formatted.length === 0) {
                                        field.onChange(undefined);
                                      }
                                    }}
                                    onBlur={() => {
                                      // Clear local input when field loses focus if date is valid
                                      if (field.value) {
                                        setDateOfBirthInput('');
                                      }
                                    }}
                                    onKeyDown={(e) => {
                                      // Allow backspace, delete, arrow keys, tab
                                      if (['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.key)) {
                                        return;
                                      }
                                      // Only allow digits
                                      if (!/^\d$/.test(e.key)) {
                                        e.preventDefault();
                                      }
                                    }}
                                    maxLength={10}
                                    className="pr-10"
                                  />
                                  <PopoverTrigger asChild>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        setDateOfBirthOpen(true);
                                      }}
                                    >
                                      <CalendarIcon className="h-4 w-4 opacity-50" />
                                    </Button>
                                  </PopoverTrigger>
                                </div>
                              </FormControl>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={(date) => {
                                    field.onChange(date);
                                    setDateOfBirthInput(''); // Clear local input, will show formatted date from field.value
                                    setDateOfBirthOpen(false);
                                  }}
                                  disabled={(date) =>
                                    date > new Date() || date < new Date("1900-01-01")
                                  }
                                  initialFocus
                                  className={cn("p-3 pointer-events-auto")}
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                            <p className="text-xs text-muted-foreground">DD/MM/YYYY or use calendar</p>
                          </FormItem>
                        )}
                    />
                    <FormField
                      control={form.control}
                      name="nationality"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Nationality</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select nationality" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="z-50 bg-popover">
                              <SelectItem value="Indian">Indian</SelectItem>
                              <SelectItem value="American">American</SelectItem>
                              <SelectItem value="British">British</SelectItem>
                              <SelectItem value="Canadian">Canadian</SelectItem>
                              <SelectItem value="Australian">Australian</SelectItem>
                              <SelectItem value="German">German</SelectItem>
                              <SelectItem value="French">French</SelectItem>
                              <SelectItem value="Japanese">Japanese</SelectItem>
                              <SelectItem value="Chinese">Chinese</SelectItem>
                              <SelectItem value="Brazilian">Brazilian</SelectItem>
                              <SelectItem value="Mexican">Mexican</SelectItem>
                              <SelectItem value="South African">South African</SelectItem>
                              <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="panCardNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>PAN Card (optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="ABCDE1234F" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="maritalStatus"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Marital Status</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="single">Single</SelectItem>
                              <SelectItem value="married">Married</SelectItem>
                              <SelectItem value="divorced">Divorced</SelectItem>
                              <SelectItem value="widowed">Widowed</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Textarea 
                              placeholder="123 Main St, City, State, ZIP" 
                              className="pl-10"
                              {...field} 
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Employment Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    Employment Details
                  </CardTitle>
                  <CardDescription>Job role and organizational information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Created By Field - Read Only */}
                  <div className="p-3 bg-muted/50 rounded-lg border border-dashed">
                    <Label className="text-sm font-medium text-muted-foreground">Created By</Label>
                    <p className="text-sm font-semibold mt-1">
                      {profile?.full_name || user?.email || 'Current User'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      This employee record will be associated with your account
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="employeeId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Employee ID {generatedEmployeeId && <span className="text-muted-foreground text-xs">(Auto-generated: {generatedEmployeeId})</span>}</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input 
                                placeholder={generatedEmployeeId || "EMP-0001"} 
                                {...field}
                                readOnly
                                className="bg-muted cursor-not-allowed"
                                title="Employee ID is automatically generated"
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-1 top-1 h-7 px-2 text-xs"
                                onClick={async () => {
                                  try {
                                    const latestEmployees = await selectRecords('employee_details', {
                                      select: 'employee_id',
                                      orderBy: 'created_at DESC',
                                      limit: 1
                                    });
                                    
                                    let newId = 'EMP-0001';
                                    if (latestEmployees.length > 0 && latestEmployees[0].employee_id) {
                                      const match = latestEmployees[0].employee_id.match(/(\d+)$/);
                                      if (match) {
                                        const nextNum = parseInt(match[1]) + 1;
                                        newId = `EMP-${String(nextNum).padStart(4, '0')}`;
                                      }
                                    }
                                    setGeneratedEmployeeId(newId);
                                    form.setValue('employeeId', newId);
                                    toast({
                                      title: "Employee ID Regenerated",
                                      description: `New ID: ${newId}`,
                                    });
                                  } catch (error) {
                                    logError('Error regenerating ID:', error);
                                  }
                                }}
                              >
                                Regenerate
                              </Button>
                            </div>
                          </FormControl>
                          <FormMessage />
                          <p className="text-xs text-muted-foreground">Employee ID is automatically generated. Click "Regenerate" to get a new one.</p>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="position"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Position</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input 
                                placeholder="Software Developer" 
                                list="position-options"
                                {...field}
                              />
                              {positions.length > 0 && (
                                <datalist id="position-options">
                                  {positions.map((position) => (
                                    <option key={position} value={position} />
                                  ))}
                                </datalist>
                              )}
                            </div>
                          </FormControl>
                          {positions.length > 0 && (
                            <p className="text-xs text-muted-foreground">
                              Start typing to see suggestions or enter a custom position
                            </p>
                          )}
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="department"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Department</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value} disabled={loadingOptions}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder={loadingOptions ? "Loading departments..." : "Select department"} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {departments.length > 0 ? (
                                departments.map((dept) => (
                                  <SelectItem key={dept.id} value={dept.id}>
                                    {dept.name}
                                  </SelectItem>
                                ))
                              ) : (
                                <SelectItem value="__no_departments__" disabled>
                                  {loadingOptions ? "Loading..." : "No departments available"}
                                </SelectItem>
                              )}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="role"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>System Role</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value} disabled={loadingOptions}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder={loadingOptions ? "Loading roles..." : "Select role"} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {roles.length > 0 ? (
                                roles.map((role) => (
                                  <SelectItem key={role} value={role}>
                                    {role.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                                  </SelectItem>
                                ))
                              ) : (
                                <SelectItem value="__no_roles__" disabled>
                                  {loadingOptions ? "Loading..." : "No roles available"}
                                </SelectItem>
                              )}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="salary"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Annual Salary</FormLabel>
                          <FormControl>
                            <Input placeholder="65000" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="employmentType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Employment Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value} disabled={loadingOptions}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder={loadingOptions ? "Loading types..." : "Select type"} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {employmentTypes.length > 0 ? (
                                employmentTypes.map((type) => (
                                  <SelectItem key={type} value={type}>
                                    {type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('-')}
                                  </SelectItem>
                                ))
                              ) : (
                                <SelectItem value="__no_employment_types__" disabled>
                                  {loadingOptions ? "Loading..." : "No employment types available"}
                                </SelectItem>
                              )}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="workLocation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Work Location</FormLabel>
                          <FormControl>
                            <Input placeholder="New York Office" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="supervisor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Supervisor ID (Optional)</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter supervisor UUID (or leave empty)" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="hireDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Hire Date</FormLabel>
                        <Popover open={hireDateOpen} onOpenChange={setHireDateOpen}>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  placeholder="DD/MM/YYYY (e.g., 09/05/2007)"
                                  value={hireDateInput || (field.value ? format(field.value, "dd/MM/yyyy") : "")}
                                  onChange={(e) => {
                                    const inputValue = e.target.value;
                                    
                                    // Format the input with auto-slash insertion
                                    const formatted = formatDateInput(inputValue);
                                    
                                    // Update local state for display
                                    setHireDateInput(formatted);
                                    
                                    // Try to parse the date (DD/MM/YYYY format - Indian Standard)
                                    const parsedDate = parseIndianDate(formatted);
                                    
                                    if (parsedDate && !isNaN(parsedDate.getTime())) {
                                      const today = new Date();
                                      today.setHours(23, 59, 59, 999);
                                      const minDate = new Date("1900-01-01");
                                      
                                      if (parsedDate <= today && parsedDate >= minDate) {
                                        field.onChange(parsedDate);
                                      }
                                    } else if (formatted.length === 0) {
                                      field.onChange(undefined);
                                    }
                                  }}
                                  onBlur={() => {
                                    // Clear local input when field loses focus if date is valid
                                    if (field.value) {
                                      setHireDateInput('');
                                    }
                                  }}
                                  onKeyDown={(e) => {
                                    // Allow backspace, delete, arrow keys, tab
                                    if (['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.key)) {
                                      return;
                                    }
                                    // Only allow digits
                                    if (!/^\d$/.test(e.key)) {
                                      e.preventDefault();
                                    }
                                  }}
                                  maxLength={10}
                                  className="pr-10"
                                />
                                <PopoverTrigger asChild>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      setDateOfBirthOpen(true);
                                    }}
                                  >
                                    <CalendarIcon className="h-4 w-4 opacity-50" />
                                  </Button>
                                </PopoverTrigger>
                              </div>
                            </FormControl>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={(date) => {
                                  field.onChange(date);
                                  setHireDateInput(''); // Clear local input, will show formatted date from field.value
                                  setHireDateOpen(false);
                                }}
                                disabled={(date) =>
                                  date > new Date() || date < new Date("1900-01-01")
                                }
                                initialFocus
                                className={cn("p-3 pointer-events-auto")}
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                          <p className="text-xs text-muted-foreground">DD/MM/YYYY or use calendar</p>
                        </FormItem>
                      )}
                  />
                </CardContent>
              </Card>

              <EmergencyContactSection form={form} />

              <DocumentUploadSection
                uploadedFiles={uploadedFiles}
                onFileUpload={handleFileUpload}
                onRemoveFile={removeFile}
                formatFileSize={formatFileSize}
              />
            </div>

            {/* Right Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Additional Notes</CardTitle>
                  <CardDescription>Any additional information about the employee</CardDescription>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Textarea 
                            placeholder="Add any additional notes or comments about the employee..."
                            className="min-h-[200px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Creating Employee...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Create Employee
                      </>
                    )}
                  </Button>
                  <Button asChild variant="outline" className="w-full">
                    <Link to="/employee-management">Cancel</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default CreateEmployee;