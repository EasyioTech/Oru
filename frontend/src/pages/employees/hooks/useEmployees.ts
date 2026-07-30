/**
 * Hook for employee data fetching.
 * Fetches from unified_employees view with a cap for scalability (per-agency DB).
 */

import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { fetchJson } from '@/utils/authApi';

/** Max employees to fetch in one request (per-agency); avoids unbounded load for large tenants. */
const EMPLOYEE_FETCH_LIMIT = 2000;

export interface UnifiedEmployee {
  id: string;
  user_id: string;
  employee_id: string;
  full_name: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  department?: string;
  department_id?: string;
  position?: string;
  role: string;
  status: string;
  is_active: boolean;
  hire_date?: string;
  employment_type?: string;
  work_location?: string;
  avatar_url?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
}

interface EmployeeApiResponse {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone?: string;
  department_id?: string;
  position?: string;
  status?: string;
  hire_date?: string;
  employment_type?: string;
  work_location?: string;
}

export const useEmployees = (urlDepartmentId?: string | null) => {
  const { toast } = useToast();
  const [employees, setEmployees] = useState<UnifiedEmployee[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEmployees = useCallback(async () => {
    try {
      setLoading(true);

      const query = new URLSearchParams();
      if (urlDepartmentId) query.set('departmentId', urlDepartmentId);
      const data = await fetchJson(`/hr/employees${query.toString() ? `?${query.toString()}` : ''}`) as EmployeeApiResponse[];

      const unifiedEmployees: UnifiedEmployee[] = data.map((emp) => ({
        id: emp.id,
        user_id: emp.id,
        employee_id: emp.id,
        full_name: `${emp.first_name || ''} ${emp.last_name || ''}`.trim(),
        first_name: emp.first_name || '',
        last_name: emp.last_name || '',
        email: emp.email || '',
        phone: emp.phone,
        department: emp.department_id,
        department_id: emp.department_id,
        position: emp.position,
        role: 'employee',
        status: emp.status || 'active',
        is_active: emp.status === 'active',
        hire_date: emp.hire_date,
        employment_type: emp.employment_type,
        work_location: emp.work_location,
        avatar_url: undefined,
        emergency_contact_name: undefined,
        emergency_contact_phone: undefined,
      }));

      setEmployees(unifiedEmployees);
    } catch (error: any) {
      console.error('Error fetching employees:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch employees. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [urlDepartmentId, toast]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  return {
    employees,
    loading,
    fetchEmployees,
    setEmployees,
    fetchLimit: EMPLOYEE_FETCH_LIMIT,
    hasReachedLimit: employees.length >= EMPLOYEE_FETCH_LIMIT,
  };
};

