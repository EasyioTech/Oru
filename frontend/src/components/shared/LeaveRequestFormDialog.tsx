import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { fetchLeaveTypes, createLeaveRequest, updateLeaveRequest } from '@/services/api/hr/leaves';
import type { User, LeaveRequest } from '@/types/models';
import { getEmployeesForAssignmentAuto } from '@/services/api/selectors';

interface LeaveRequestFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  leaveRequest?: LeaveRequest | null;
  onLeaveRequestSaved: () => void;
  isEmployeeView?: boolean; // If true, hide employee selector and status field
}

const LeaveRequestFormDialog: React.FC<LeaveRequestFormDialogProps> = ({
  isOpen,
  onClose,
  leaveRequest,
  onLeaveRequestSaved,
  isEmployeeView = false,
}) => {
  const { toast } = useToast();
  const { user, userRole, profile } = useAuth();
  
  // Check if user is admin/HR (can manage all requests)
  const isAdminOrHR = userRole === 'agency_admin' || userRole === 'super_admin' || userRole === 'manager';
  const canManageRequests = isAdminOrHR && !isEmployeeView;
  const [loading, setLoading] = useState(false);
  const [leaveTypes, setLeaveTypes] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  const [formData, setFormData] = useState({
    employee_id: '',
    leave_type_id: '',
    start_date: '',
    end_date: '',
    reason: '',
    status: 'pending',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Format date for input field (YYYY-MM-DD)
  const formatDateForInput = (dateString: string | null | undefined): string => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      return date.toISOString().split('T')[0];
    } catch {
      return '';
    }
  };

  // Calculate total days between start and end date
  const calculateDays = (start: string, end: string): number => {
    if (!start || !end) return 0;
    try {
      const startDate = new Date(start);
      const endDate = new Date(end);
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return 0;
      const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      return diffDays > 0 ? diffDays : 0;
    } catch {
      return 0;
    }
  };

  // Fetch leave types and employees when dialog opens
  useEffect(() => {
    if (isOpen) {
      if (leaveRequest && leaveRequest.id) {
        // Editing existing leave request
        setFormData({
          employee_id: leaveRequest.employee_id || '',
          leave_type_id: leaveRequest.leave_type_id || '',
          start_date: formatDateForInput(leaveRequest.start_date),
          end_date: formatDateForInput(leaveRequest.end_date),
          reason: leaveRequest.reason || '',
          status: leaveRequest.status || 'pending',
        });
      } else {
        // Creating new leave request
        // For employee view, always use current user and set status to pending
        const employeeId = isEmployeeView && user?.id ? user.id : (user?.id || '');
        setFormData({
          employee_id: employeeId,
          leave_type_id: '',
          start_date: '',
          end_date: '',
          reason: '',
          status: 'pending', // Always pending for new requests from employees
        });
      }
      setErrors({});
    }
  }, [leaveRequest, isOpen, user, isEmployeeView]);

  // Define fetchData before using it in useEffect
  const fetchData = React.useCallback(async () => {
    try {
      setLoadingData(true);

      // Fetch leave types
      const types = await fetchLeaveTypes();
      setLeaveTypes(types);

      // Only fetch employees list if user is admin/HR and not in employee view
      if (canManageRequests) {
        // Use standardized employee fetching service
        const employeesData = await getEmployeesForAssignmentAuto(profile, user?.id);
        setEmployees(employeesData.map(emp => ({
          id: emp.user_id,
          name: emp.full_name
        })));
      } else {
        // For employee view, just set current user as the only employee
        if (user?.id) {
          // Use standardized service to get current user's info
          const employeesData = await getEmployeesForAssignmentAuto(profile, user?.id);
          const currentUser = employeesData.find(emp => emp.user_id === user.id);
          setEmployees([{ 
            id: user.id, 
            name: currentUser?.full_name || profile?.full_name || 'You' 
          }]);
        }
      }
    } catch (error: any) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load leave types and employees',
        variant: 'destructive',
      });
    } finally {
      setLoadingData(false);
    }
  }, [canManageRequests, profile, user?.id, toast]);

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen, fetchData]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // For employee view, ensure employee_id is set to current user
    if (isEmployeeView && user?.id) {
      if (formData.employee_id !== user.id) {
        setFormData({ ...formData, employee_id: user.id });
      }
    }

    if (!formData.employee_id) {
      newErrors.employee_id = 'Employee is required';
    }

    if (!formData.leave_type_id) {
      newErrors.leave_type_id = 'Leave type is required';
    }

    if (!formData.start_date) {
      newErrors.start_date = 'Start date is required';
    }

    if (!formData.end_date) {
      newErrors.end_date = 'End date is required';
    }

    if (formData.start_date && formData.end_date) {
      const start = new Date(formData.start_date);
      const end = new Date(formData.end_date);
      if (end < start) {
        newErrors.end_date = 'End date must be after start date';
      }
    }

    if (!formData.reason || formData.reason.trim().length === 0) {
      newErrors.reason = 'Reason is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!user?.id) {
      toast({
        title: 'Error',
        description: 'You must be logged in to submit leave requests',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);

      const totalDays = calculateDays(formData.start_date, formData.end_date);

      if (leaveRequest && leaveRequest.id) {
        // Update existing leave request
        await updateLeaveRequest(leaveRequest.id, {
            employee_id: formData.employee_id,
            leave_type_id: formData.leave_type_id,
            start_date: formData.start_date,
            end_date: formData.end_date,
            total_days: totalDays,
            reason: formData.reason.trim(),
            status: formData.status as any,
          }
        );

        toast({
          title: 'Success',
          description: 'Leave request updated successfully',
        });
      } else {
        // Create new leave request
        // For employee view, always set status to 'pending'
        const requestStatus = isEmployeeView ? 'pending' : formData.status;
        
        await createLeaveRequest({
            employee_id: formData.employee_id,
            leave_type_id: formData.leave_type_id,
            start_date: formData.start_date,
            end_date: formData.end_date,
            total_days: totalDays,
            reason: formData.reason.trim(),
            status: requestStatus as any,
        });

        toast({
          title: 'Success',
          description: 'Leave request created successfully',
        });
      }

      onLeaveRequestSaved();
      onClose();
    } catch (error: any) {
      console.error('Error saving leave request:', error);
      toast({
        title: 'Error',
        description: error.message || error.detail || 'Failed to save leave request',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const totalDays = calculateDays(formData.start_date, formData.end_date);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        onClose();
      }
    }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {leaveRequest ? 'Edit Leave Request' : 'Create Leave Request'}
          </DialogTitle>
          <DialogDescription>
            {leaveRequest
              ? 'Update the leave request details below.'
              : 'Fill in the details to create a new leave request.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Employee selector - only show for admins/HR */}
          {canManageRequests ? (
            <div className="space-y-2">
              <Label htmlFor="employee_id">
                Employee <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.employee_id}
                onValueChange={(value) => setFormData({ ...formData, employee_id: value })}
                disabled={loadingData || loading}
              >
                <SelectTrigger id="employee_id">
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((emp) => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {emp.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.employee_id && (
                <p className="text-sm text-destructive">{errors.employee_id}</p>
              )}
            </div>
          ) : (
            // For employees, show read-only employee name
            <div className="space-y-2">
              <Label>Employee</Label>
              <Input
                value={employees.find(e => e.id === formData.employee_id)?.name || 'You'}
                disabled
                className="bg-muted"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="leave_type_id">
              Leave Type <span className="text-destructive">*</span>
            </Label>
            <Select
              value={formData.leave_type_id}
              onValueChange={(value) => setFormData({ ...formData, leave_type_id: value })}
              disabled={loadingData || loading}
            >
              <SelectTrigger id="leave_type_id">
                <SelectValue placeholder="Select leave type" />
              </SelectTrigger>
              <SelectContent>
                {leaveTypes.map((type: any) => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.name}
                    {(type.max_days_per_year || type.max_days) && ` (Max: ${type.max_days_per_year || type.max_days} days)`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.leave_type_id && (
              <p className="text-sm text-destructive">{errors.leave_type_id}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_date">
                Start Date <span className="text-destructive">*</span>
              </Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                disabled={loading}
              />
              {errors.start_date && (
                <p className="text-sm text-destructive">{errors.start_date}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="end_date">
                End Date <span className="text-destructive">*</span>
              </Label>
              <Input
                id="end_date"
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                disabled={loading}
                min={formData.start_date}
              />
              {errors.end_date && (
                <p className="text-sm text-destructive">{errors.end_date}</p>
              )}
            </div>
          </div>

          {totalDays > 0 && (
            <div className="text-sm text-muted-foreground">
              Total Days: <span className="font-semibold">{totalDays}</span>
            </div>
          )}

          {/* Status field - only show for admins/HR */}
          {canManageRequests && (
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
                disabled={loading}
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="reason">
              Reason <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="reason"
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              placeholder="Enter reason for leave request..."
              rows={4}
              disabled={loading}
            />
            {errors.reason && (
              <p className="text-sm text-destructive">{errors.reason}</p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || loadingData}>
              {loading ? 'Saving...' : leaveRequest ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default LeaveRequestFormDialog;
