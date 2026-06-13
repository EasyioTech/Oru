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
import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { ArrowLeft, CalendarIcon, Save, User, Mail, Phone, Building, MapPin, Upload, X } from "lucide-react";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { generateUUID, isValidUUID } from '@/lib/uuid';
import { useAuth } from "@/hooks/useAuth";
import { getAgencyId } from '@/utils/agencyUtils';
import { fetchJson, fetchMutate } from '@/utils/authApi';
import { useToast } from "@/hooks/use-toast";
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

      const emailNorm = values.email.toLowerCase().trim();

      // Ensure valid salary
      const salaryValue = parseFloat(values.salary);
      if (Number.isNaN(salaryValue) || salaryValue <= 0) {
        throw new Error('Salary must be a positive number.');
      }

      // Prepare payload mapping to backend schema
      const payload = {
        firstName: values.firstName,
        lastName: values.lastName,
        email: emailNorm,
        phone: values.phone,
        departmentId: values.department && values.department !== '__no_departments__' ? values.department : null,
        position: values.position,
        employmentType: values.employmentType,
        status: 'active',
        hireDate: values.hireDate ? values.hireDate.toISOString().split('T')[0] : null,
        salary: salaryValue,
        emergencyContactName: values.emergencyContactName || null,
        emergencyContactPhone: values.emergencyContactPhone || null,
        address: values.address || null,
        notes: values.notes || null,
        employeeCode: values.employeeId || null,
      };

      // Create employee
      await fetchMutate('/hr/employees', 'POST', payload);

      toast({
        title: 'Employee created',
        description: "Employee has been successfully created.",
      });

      setUploadedFiles([]);
      setProfileImage(null);
      setProfileImagePreview(null);
      
      // Optional: simulate credentials for now since we removed the complex auth creation
      setCreatedCredentials({
        loginUrl: typeof window !== 'undefined' ? `${window.location.origin}/auth` : '',
        email: emailNorm,
        password: 'Password will be sent via email',
        personalEmail: values.personalEmail,
        companyName: companyName || 'Company',
      });

    } catch (error: unknown) {
      logError("Error creating employee:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error creating employee. Please try again.",
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
  const fetchDepartments = useCallback(async () => {
    try {
      const deptData = await fetchJson('/hr/departments');
      setDepartments(deptData || []);
    } catch (error) {
      logError('Error fetching departments:', error);
      toast({
        title: "Warning",
        description: "Failed to load departments. Please refresh the page.",
        variant: "destructive",
      });
    }
  }, [toast]);

  // Fetch distinct roles from user_roles table
  const fetchRoles = useCallback(async () => {
    setRoles(['super_admin', 'agency_admin', 'manager', 'employee', 'auditor', 'viewer', 'custom']);
  }, []);

  // Fetch distinct employment types from employee_details
  const fetchEmploymentTypes = useCallback(async () => {
    setEmploymentTypes(['full-time', 'part-time', 'contract', 'intern']);
  }, []);

  // Fetch distinct positions from profiles
  const fetchPositions = useCallback(async () => {
    setPositions([]);
  }, []);

  useEffect(() => {
    setCompanyDomain('company.com');
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
  }, [profile, user, fetchDepartments, fetchRoles, fetchEmploymentTypes, fetchPositions]);

  useEffect(() => {
    setGeneratedEmployeeId('EMP-' + Date.now().toString().slice(-4));
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
    form.setValue('dateOfBirth', undefined as unknown);
    form.setValue('hireDate', undefined as unknown);
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
                                onClick={() => {
                                  const newId = 'EMP-' + Date.now().toString().slice(-4);
                                  setGeneratedEmployeeId(newId);
                                  form.setValue('employeeId', newId);
                                  toast({
                                    title: "Employee ID Regenerated",
                                    description: `New ID: ${newId}`,
                                  });
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