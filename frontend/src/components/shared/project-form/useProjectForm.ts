import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { projectService, Project as ProjectType } from '@/services/api/projects';
import { getEmployeesForAssignmentAuto, getClientsForSelectionAuto } from '@/services/api/selectors';
import { getDepartmentsForSelectionAuto } from '@/services/api/departments';
import { type Project, type Client, type Employee, type Department } from './types';

const DEFAULT_FORM: Project = {
  name: '', description: '', project_code: null, project_type: null,
  status: 'planning', priority: 'medium',
  start_date: null, end_date: null, deadline: null,
  budget: null, actual_cost: 0, allocated_budget: null, cost_center: null, currency: 'USD',
  client_id: null, project_manager_id: null, account_manager_id: null,
  assigned_team: [], departments: [], tags: [], categories: [], progress: 0,
};

function normalizeForDisplay(s?: string) {
  if (!s) return 'planning';
  if (s === 'in_progress') return 'in-progress';
  if (s === 'on_hold') return 'on-hold';
  return s;
}

function normalizeForDB(s: string) {
  if (s === 'in-progress') return 'in_progress';
  if (s === 'on-hold') return 'on_hold';
  return s;
}

function formatDateForInput(d?: string | null): string | null {
  if (!d) return null;
  try {
    if (/^\d{4}-\d{2}-\d{2}$/.test(d)) return d < '2000-01-01' ? null : d;
    const date = new Date(d);
    if (isNaN(date.getTime())) return null;
    const y = date.getFullYear();
    if (y < 2000 || y > 2100) return null;
    return date.toISOString().split('T')[0];
  } catch { return null; }
}

export function useProjectForm(project: Project | null | undefined, isOpen: boolean, onClose: () => void, onProjectSaved: () => void) {
  const { toast } = useToast();
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Project>(DEFAULT_FORM);
  const [clients, setClients] = useState<Client[]>([]);
  const [loadingClients, setLoadingClients] = useState(false);
  const [clientSearchOpen, setClientSearchOpen] = useState(false);
  const [clientSearchTerm, setClientSearchTerm] = useState('');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [selectedTeamMembers, setSelectedTeamMembers] = useState<string[]>([]);
  const [teamMemberSearchOpen, setTeamMemberSearchOpen] = useState(false);
  const [teamMemberSearchTerm, setTeamMemberSearchTerm] = useState('');
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loadingDepartments, setLoadingDepartments] = useState(false);
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [categoryInput, setCategoryInput] = useState('');

  const fetchClients = React.useCallback(async () => {
    try {
      setLoadingClients(true);
      const data = await getClientsForSelectionAuto(profile, user?.id, { includeInactive: false });
      setClients(data.map(c => ({ id: c.id, name: c.name, company_name: c.company_name, email: c.email })));
    } catch { toast({ title: 'Error', description: 'Failed to load clients', variant: 'destructive' }); }
    finally { setLoadingClients(false); }
  }, [profile, user?.id, toast]);

  const fetchEmployees = React.useCallback(async () => {
    try {
      setLoadingEmployees(true);
      const data = await getEmployeesForAssignmentAuto(profile, user?.id);
      setEmployees(data.map(e => ({ id: e.user_id, user_id: e.user_id, full_name: e.full_name, display_name: e.display_name || e.full_name, department: e.department, position: e.position })));
    } catch { toast({ title: 'Error', description: 'Failed to load employees', variant: 'destructive' }); }
    finally { setLoadingEmployees(false); }
  }, [profile, user?.id, toast]);

  const fetchDepartments = React.useCallback(async () => {
    try {
      setLoadingDepartments(true);
      const data = await getDepartmentsForSelectionAuto(profile, user?.id, { includeInactive: false });
      setDepartments(data.map(d => ({ id: d.id, name: d.name, manager_name: d.manager_name || undefined, member_count: d.member_count || undefined })));
    } catch { toast({ title: 'Error', description: 'Failed to load departments', variant: 'destructive' }); }
    finally { setLoadingDepartments(false); }
  }, [profile, user?.id, toast]);

  useEffect(() => { if (isOpen) { fetchClients(); fetchEmployees(); fetchDepartments(); } }, [isOpen, fetchClients, fetchEmployees, fetchDepartments]);

  useEffect(() => {
    if (!isOpen) return;
    if (project?.id) {
      const p = project as any;
      setFormData({
        name: p.name || '', description: p.description || '', project_code: p.project_code || null,
        project_type: p.project_type || null, status: normalizeForDisplay(p.status), priority: p.priority || 'medium',
        start_date: formatDateForInput(p.start_date), end_date: formatDateForInput(p.end_date),
        deadline: formatDateForInput(p.deadline), budget: p.budget || null, actual_cost: p.actual_cost || 0,
        allocated_budget: p.allocated_budget || null, cost_center: p.cost_center || null, currency: p.currency || 'USD',
        client_id: p.client_id || null, project_manager_id: p.project_manager_id || null,
        account_manager_id: p.account_manager_id || null, assigned_team: [],
        departments: Array.isArray(p.departments) ? p.departments : [],
        tags: Array.isArray(p.tags) ? p.tags : [],
        categories: Array.isArray(p.categories) ? p.categories : [],
        progress: p.progress || 0,
      });
      let parsed: string[] = [];
      if (p.assigned_team) {
        if (typeof p.assigned_team === 'string') {
          try { const j = JSON.parse(p.assigned_team); if (Array.isArray(j)) parsed = j.map((m: any) => typeof m === 'string' ? m : m.user_id || m.id || String(m)); } catch { parsed = []; }
        } else if (Array.isArray(p.assigned_team)) {
          parsed = p.assigned_team.map((m: any) => typeof m === 'string' ? m : m.user_id || m.id || String(m));
        }
      }
      setSelectedTeamMembers(parsed);
      setSelectedDepartments(Array.isArray(p.departments) ? p.departments : []);
    } else {
      setFormData(DEFAULT_FORM);
      setSelectedTeamMembers([]); setSelectedDepartments([]);
      setTagInput(''); setCategoryInput('');
    }
  }, [project, isOpen]);

  const addTag = () => { if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) { setFormData(p => ({ ...p, tags: [...(p.tags || []), tagInput.trim()] })); setTagInput(''); } };
  const removeTag = (tag: string) => setFormData(p => ({ ...p, tags: (p.tags || []).filter(t => t !== tag) }));
  const addCategory = () => { if (categoryInput.trim() && !formData.categories?.includes(categoryInput.trim())) { setFormData(p => ({ ...p, categories: [...(p.categories || []), categoryInput.trim()] })); setCategoryInput(''); } };
  const removeCategory = (c: string) => setFormData(p => ({ ...p, categories: (p.categories || []).filter(x => x !== c) }));
  const toggleTeamMember = (uid: string) => setSelectedTeamMembers(p => p.includes(uid) ? p.filter(id => id !== uid) : [...p, uid]);
  const toggleDepartment = (id: string) => setSelectedDepartments(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) { toast({ title: 'Validation Error', description: 'Project name is required', variant: 'destructive' }); return; }
    if (formData.progress < 0 || formData.progress > 100) { toast({ title: 'Validation Error', description: 'Progress must be between 0 and 100', variant: 'destructive' }); return; }
    const minDate = '2000-01-01';
    for (const [field, val] of [['Start date', formData.start_date], ['End date', formData.end_date], ['Deadline', formData.deadline]] as [string, string | null][]) {
      if (val && val < minDate) { toast({ title: 'Validation Error', description: `${field} cannot be before year 2000`, variant: 'destructive' }); return; }
    }
    if (formData.start_date && formData.end_date && formData.start_date > formData.end_date) { toast({ title: 'Validation Error', description: 'End date must be after start date', variant: 'destructive' }); return; }
    if (formData.start_date && formData.deadline && formData.start_date > formData.deadline) { toast({ title: 'Validation Error', description: 'Deadline must be after start date', variant: 'destructive' }); return; }
    if (formData.allocated_budget && formData.budget && formData.allocated_budget > formData.budget) { toast({ title: 'Validation Error', description: 'Allocated budget cannot exceed total budget', variant: 'destructive' }); return; }
    setLoading(true);
    try {
      const payload: Partial<ProjectType> = {
        ...formData, status: normalizeForDB(formData.status) as any,
        name: formData.name.trim(), description: formData.description?.trim() || null,
        assigned_team: selectedTeamMembers, departments: selectedDepartments,
      };
      if (project?.id) { await projectService.updateProject(project.id, payload, profile, user?.id); toast({ title: 'Success', description: 'Project updated successfully' }); }
      else { await projectService.createProject(payload, profile, user?.id); toast({ title: 'Success', description: 'Project created successfully' }); }
      onProjectSaved(); onClose();
    } catch (error: any) { toast({ title: 'Error', description: (error as Error).message || 'Failed to save project', variant: 'destructive' }); }
    finally { setLoading(false); }
  };

  const filteredClients = clients.filter(c => c.name.toLowerCase().includes(clientSearchTerm.toLowerCase()) || c.company_name?.toLowerCase().includes(clientSearchTerm.toLowerCase()) || c.email?.toLowerCase().includes(clientSearchTerm.toLowerCase()));
  const filteredEmployees = employees.filter(e => e.full_name.toLowerCase().includes(teamMemberSearchTerm.toLowerCase()) || e.display_name?.toLowerCase().includes(teamMemberSearchTerm.toLowerCase()) || e.department?.toLowerCase().includes(teamMemberSearchTerm.toLowerCase()));
  const selectedClient = clients.find(c => c.id === formData.client_id);
  const selectedTeamMemberObjects = employees.filter(e => selectedTeamMembers.includes(e.user_id));
  const selectedDepartmentObjects = departments.filter(d => selectedDepartments.includes(d.id));

  return {
    loading, formData, setFormData,
    clients, loadingClients, clientSearchOpen, setClientSearchOpen, clientSearchTerm, setClientSearchTerm,
    employees, loadingEmployees, selectedTeamMembers, teamMemberSearchOpen, setTeamMemberSearchOpen, teamMemberSearchTerm, setTeamMemberSearchTerm,
    departments, loadingDepartments, selectedDepartments,
    tagInput, setTagInput, categoryInput, setCategoryInput,
    addTag, removeTag, addCategory, removeCategory, toggleTeamMember, toggleDepartment, handleSubmit,
    filteredClients, filteredEmployees, selectedClient, selectedTeamMemberObjects, selectedDepartmentObjects,
  };
}

export type UseProjectFormReturn = ReturnType<typeof useProjectForm>;
