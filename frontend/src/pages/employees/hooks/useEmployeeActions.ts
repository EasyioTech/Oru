/**
 * Hook for employee CRUD operations
 */

import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { fetchMutate } from '@/utils/authApi';
import { normalizeEmploymentType } from '../utils/employeeUtils';
import type { UnifiedEmployee } from '../hooks/useEmployees';

export const useEmployeeActions = () => {
  const { toast } = useToast();
  const { user, profile } = useAuth();
  const [saving, setSaving] = useState(false);

  const saveEmployee = async (
    selectedEmployee: UnifiedEmployee | null,
    editForm: Partial<UnifiedEmployee>,
    onSuccess?: () => void
  ) => {
    if (!selectedEmployee || !user?.id) {
      toast({
        title: "Error",
        description: "You must be logged in to update employees",
        variant: "destructive",
      });
      return;
    }
    
    setSaving(true);
    try {
      const wasInactive = !selectedEmployee.is_active;
      const isNowActive = editForm.is_active;
      const statusChangedToActive = wasInactive && isNowActive;

      const nameParts = (editForm.full_name || '').trim().split(/\s+/);
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      const normalizedEmploymentType = normalizeEmploymentType(editForm.employment_type);

      const payload = {
        first_name: firstName,
        last_name: lastName,
        phone: editForm.phone,
        department_id: editForm.department,
        position: editForm.position,
        employment_type: normalizedEmploymentType,
        work_location: editForm.work_location,
        status: editForm.is_active ? 'active' : 'inactive'
      };

      await fetchMutate(`/hr/employees/${selectedEmployee.user_id}`, 'PUT', payload);

      toast({
        title: "Success",
        description: statusChangedToActive
          ? "Employee reactivated successfully"
          : "Employee updated successfully",
      });
      onSuccess?.();
    } catch (error: any) {
      console.error('Error updating employee:', error);
      const message = error instanceof Error ? error.message : "Failed to update employee. Please try again.";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const deleteEmployee = async (
    selectedEmployee: UnifiedEmployee | null,
    onSuccess?: () => void
  ) => {
    if (!selectedEmployee?.user_id || !user?.id) {
      toast({
        title: "Error",
        description: "You must be logged in to delete employees.",
        variant: "destructive",
      });
      return;
    }

    try {
      await fetchMutate(`/hr/employees/${selectedEmployee.user_id}`, 'DELETE');
      toast({
        title: "Success",
        description: "Employee deleted successfully",
      });
      if (onSuccess) onSuccess();
    } catch (error: any) {
      console.error('Error deleting employee:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete employee.",
        variant: "destructive",
      });
    }
  };

  const deleteUser = async (
    selectedUser: UnifiedEmployee | null,
    onSuccess?: () => void
  ) => {
    if (!selectedUser?.user_id || !user?.id) {
      toast({
        title: "Error",
        description: "You must be logged in to delete users.",
        variant: "destructive",
      });
      return;
    }

    try {
      await fetchMutate(`/hr/employees/${selectedUser.user_id}`, 'DELETE');
      toast({
        title: "Success",
        description: "User deleted successfully. They will now appear in the 'Trash' tab.",
      });
      if (onSuccess) onSuccess();
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete user. Please check console for details.",
        variant: "destructive",
      });
    }
  };

  return {
    saving,
    saveEmployee,
    deleteEmployee,
    deleteUser,
  };
};

