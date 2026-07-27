import { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { departments, employees, leaveTypes, leaveRequests } from './schema.js';

export type Department = InferSelectModel<typeof departments>;
export type NewDepartment = InferInsertModel<typeof departments>;
export type Employee = InferSelectModel<typeof employees>;
export type NewEmployee = InferInsertModel<typeof employees>;
export type LeaveType = InferSelectModel<typeof leaveTypes>;
export type LeaveRequest = InferSelectModel<typeof leaveRequests>;
export type NewLeaveRequest = InferInsertModel<typeof leaveRequests>;

export interface DepartmentBody {
    name: string;
    description?: string;
    managerId?: string;
}

export interface EmployeeBody {
    userId?: string;
    profileId?: string;
    departmentId?: string;
    employeeCode?: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    position?: string;
    employmentType?: string;
    status?: string;
    hireDate?: string;
    salary?: string | number;
    emergencyContactName?: string;
    emergencyContactPhone?: string;
    address?: string;
    avatarUrl?: string;
    notes?: string;
}
