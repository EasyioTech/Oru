import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { getAccessibleEmployees } from "@/services/api/hr";
import { Loader2 } from "lucide-react";
import { selectRecords } from '@/services/api/core';

interface Employee {
  id: string;
  user_id: string;
  full_name: string;
  department: string | null;
}

interface EmployeeSelectorProps {
  selectedEmployeeId: string | null;
  onEmployeeChange: (employeeId: string) => void;
}

export function EmployeeSelector({ selectedEmployeeId, onEmployeeChange }: EmployeeSelectorProps) {
  const { user, userRole, profile, loading: authLoading } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchEmployees = React.useCallback(async () => {
    if (!user || !userRole) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Check access level
      const fullAccessRoles = ['super_admin', 'agency_admin', 'manager'];
      
      if (fullAccessRoles.includes(userRole)) {
        // Full access - get all employees
        try {
          const allEmployees = await getAccessibleEmployees(userRole, null);
          setEmployees(allEmployees);
          
          // Auto-select current user if no selection
          if (!selectedEmployeeId && user.id) {
            const currentUserEmployee = allEmployees.find(emp => emp.user_id === user.id);
            if (currentUserEmployee) {
              onEmployeeChange(currentUserEmployee.user_id);
            }
          }
        } catch (err: unknown) {
          console.error('Error fetching all employees:', err);
          setError('Failed to load employees. Please try again.');
          // Fallback to self-only
          setEmployees([{
            id: user.id,
            user_id: user.id,
            full_name: profile?.full_name || 'You',
            department: profile?.department || null,
          }]);
        }
      } else {
        // Self-only access - only show current user
        setEmployees([{
          id: user.id,
          user_id: user.id,
          full_name: profile?.full_name || 'You',
          department: profile?.department || null,
        }]);
        
        // Auto-select
        if (!selectedEmployeeId) {
          onEmployeeChange(user.id);
        }
      }
    } catch (error: unknown) {
      console.error('Error fetching employees:', error);
      setError('Failed to load employees. Please refresh the page.');
      // Fallback to self-only
      if (user?.id) {
        setEmployees([{
          id: user.id,
          user_id: user.id,
          full_name: profile?.full_name || 'You',
          department: profile?.department || null,
        }]);
        if (!selectedEmployeeId) {
          onEmployeeChange(user.id);
        }
      }
    } finally {
      setLoading(false);
    }
  }, [user, userRole, profile, selectedEmployeeId, onEmployeeChange]);
    useEffect(() => {
        if (!authLoading && user && userRole !== undefined) {
          fetchEmployees();
        }
      }, [userRole, profile, authLoading, user, fetchEmployees]);

  if (authLoading || loading) {
    return (
      <div className="flex items-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm text-muted-foreground">Loading employees...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-sm text-destructive">
        {error}
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-sm text-muted-foreground">
        Please log in to view employees
      </div>
    );
  }

  // If only one employee (self-only access), don't show selector
  if (employees.length === 1 && employees[0].user_id === user?.id) {
    return (
      <div className="text-sm font-medium">
        {employees[0].full_name}
        {employees[0].department && (
          <span className="text-muted-foreground ml-2">({employees[0].department})</span>
        )}
      </div>
    );
  }

  return (
    <Select
      value={selectedEmployeeId || undefined}
      onValueChange={onEmployeeChange}
    >
      <SelectTrigger className="w-[250px]">
        <SelectValue placeholder="Select employee" />
      </SelectTrigger>
      <SelectContent>
        {employees.map((employee) => (
          <SelectItem key={employee.user_id} value={employee.user_id}>
            {employee.full_name}
            {employee.department && ` (${employee.department})`}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
