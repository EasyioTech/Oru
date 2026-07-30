import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { fetchJson, fetchMutate } from "@/utils/authApi";
import { getAgencyId } from "@/utils/agencyUtils";
import { logError } from "@/utils/consoleLogger";
import { type UploadedFile } from "../components";
import { formSchema, type FormValues, type Department, DEFAULT_FORM_VALUES } from "../formSchema";

interface Credentials {
  loginUrl: string;
  email: string;
  password: string;
  companyName: string;
  personalEmail?: string;
}

export function useCreateEmployee() {
  const { toast } = useToast();
  const { user, profile } = useAuth();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: DEFAULT_FORM_VALUES as FormValues,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);
  const [generatedEmployeeId, setGeneratedEmployeeId] = useState('');
  const [dateOfBirthOpen, setDateOfBirthOpen] = useState(false);
  const [hireDateOpen, setHireDateOpen] = useState(false);
  const [dateOfBirthInput, setDateOfBirthInput] = useState('');
  const [hireDateInput, setHireDateInput] = useState('');
  const [createdCredentials, setCreatedCredentials] = useState<Credentials | null>(null);
  const [copiedCreds, setCopiedCreds] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);

  const companyDomain = 'company.com';
  const roles = ['super_admin', 'agency_admin', 'manager', 'employee', 'auditor', 'viewer', 'custom'];
  const employmentTypes = ['full-time', 'part-time', 'contract', 'intern'];

  useEffect(() => {
    setGeneratedEmployeeId('EMP-' + Date.now().toString().slice(-4));
  }, []);

  const fetchDepartments = useCallback(async () => {
    try {
      const deptData = await fetchJson('/hr/departments');
      setDepartments(deptData || []);
    } catch (error) {
      logError('Error fetching departments:', error);
      toast({ title: "Warning", description: "Failed to load departments. Please refresh the page.", variant: "destructive" });
    } finally {
      setLoadingOptions(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      if (!user?.id) throw new Error('You must be logged in to create an employee');
      const agencyId = await getAgencyId(profile, user.id);
      if (!agencyId) throw new Error('Agency ID not found. Please ensure you are logged in to an agency account.');

      const emailNorm = values.email.toLowerCase().trim();
      const salaryValue = parseFloat(values.salary);
      if (Number.isNaN(salaryValue) || salaryValue <= 0) throw new Error('Salary must be a positive number.');

      await fetchMutate('/hr/employees', 'POST', {
        firstName: values.firstName, lastName: values.lastName, email: emailNorm,
        phone: values.phone, departmentId: values.department && values.department !== '__no_departments__' ? values.department : null,
        position: values.position, employmentType: values.employmentType, status: 'active',
        hireDate: values.hireDate ? values.hireDate.toISOString().split('T')[0] : null,
        salary: salaryValue, notes: values.notes || null, employeeCode: values.employeeId || null,
      });

      toast({ title: 'Employee created', description: "Employee has been successfully created." });
      setUploadedFiles([]); setProfileImage(null); setProfileImagePreview(null);
      setCreatedCredentials({
        loginUrl: typeof window !== 'undefined' ? `${window.location.origin}/auth` : '',
        email: emailNorm, password: 'Password will be sent via email',
        companyName: 'Company',
      });
    } catch (error: any) {
      logError("Error creating employee:", error);
      toast({ title: "Error", description: error instanceof Error ? error.message : "Error creating employee. Please try again.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, category: string) => {
    const files = event.target.files;
    if (!files) return;
    Array.from(files).forEach(file => {
      setUploadedFiles(prev => [...prev, {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        name: file.name, size: file.size, type: file.type, category, file,
      }]);
    });
  };

  const handleProfileImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setProfileImage(file);
    const reader = new FileReader();
    reader.onload = (e) => setProfileImagePreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const removeFile = (fileId: string) => setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  const removeProfileImage = () => { setProfileImage(null); setProfileImagePreview(null); };

  const generateWorkEmail = () => {
    const first = form.getValues('firstName')?.trim().toLowerCase().replace(/\s+/g, '.') || '';
    const last = form.getValues('lastName')?.trim().toLowerCase().replace(/\s+/g, '.') || '';
    if (!first || !last) { toast({ title: "Enter name first", description: "Fill first and last name to generate email." }); return; }
    const suggested = `${first}.${last}@${companyDomain}`;
    form.setValue('email', suggested);
    toast({ title: "Email generated", description: `Use ${suggested} or edit as needed.` });
  };

  const onRegenerateId = () => {
    const newId = 'EMP-' + Date.now().toString().slice(-4);
    setGeneratedEmployeeId(newId);
    form.setValue('employeeId', newId);
    toast({ title: "Employee ID Regenerated", description: `New ID: ${newId}` });
  };

  const credentialsText = createdCredentials
    ? [`${createdCredentials.companyName} – Employee login details`, '', 'Login URL: ' + createdCredentials.loginUrl,
       'Work email: ' + createdCredentials.email, 'Temporary password: ' + createdCredentials.password, '',
       'Please change your password after first login.',
       createdCredentials.personalEmail ? `Send this to the employee's personal email: ${createdCredentials.personalEmail}` : ''].filter(Boolean).join('\n')
    : '';

  const copyCredentials = async () => {
    try {
      await navigator.clipboard.writeText(credentialsText);
      setCopiedCreds(true);
      toast({ title: "Copied", description: "Login details copied to clipboard." });
      setTimeout(() => setCopiedCreds(false), 2000);
    } catch { toast({ title: "Copy failed", description: "Could not copy to clipboard.", variant: "destructive" }); }
  };

  const downloadCredentials = () => {
    if (!createdCredentials) return;
    const blob = new Blob([credentialsText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `login-details-${createdCredentials.email.replace('@', '-at-')}.txt`;
    a.click(); URL.revokeObjectURL(url);
    toast({ title: "Downloaded", description: "Login details saved as file." });
  };

  const dismissCredentials = () => {
    setCreatedCredentials(null);
    form.reset(DEFAULT_FORM_VALUES as FormValues);
    form.setValue('dateOfBirth', undefined as any as Date);
    form.setValue('hireDate', undefined as any as Date);
    setDateOfBirthInput(''); setHireDateInput('');
  };

  return {
    form, user, profile, isSubmitting, onSubmit,
    uploadedFiles, handleFileUpload, removeFile,
    profileImage, profileImagePreview, handleProfileImageUpload, removeProfileImage,
    generatedEmployeeId, onRegenerateId,
    dateOfBirthOpen, setDateOfBirthOpen, dateOfBirthInput, setDateOfBirthInput,
    hireDateOpen, setHireDateOpen, hireDateInput, setHireDateInput,
    companyDomain, generateWorkEmail,
    departments, roles, employmentTypes, loadingOptions,
    createdCredentials, copiedCreds, credentialsText, copyCredentials, downloadCredentials, dismissCredentials,
  };
}
