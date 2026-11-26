import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DepartmentService } from './department-management/department.service.js';
import { EmployeeService } from './employee-management/employee.service.js';
import { LeaveService } from './leave-management/leave.service.js';
import { DepartmentBody, EmployeeBody } from './types.js';

export class HrService {
  private departmentService: DepartmentService;
  private employeeService: EmployeeService;
  private leaveService: LeaveService;

  constructor(
    private db: NodePgDatabase<any> | any,
    private agencyId: string
  ) {
    this.departmentService = new DepartmentService(db, agencyId);
    this.employeeService = new EmployeeService(db, agencyId);
    this.leaveService = new LeaveService(db, agencyId);
  }

  // Department Management
  async getDepartmentStats() {
    return this.departmentService.getDepartmentStats();
  }

  async getDepartments(isActive?: string, search?: string) {
    return this.departmentService.getDepartments(isActive, search);
  }

  async getDepartmentById(id: string) {
    return this.departmentService.getDepartmentById(id);
  }

  async createDepartment(body: DepartmentBody) {
    return this.departmentService.createDepartment(body as any);
  }

  async updateDepartment(id: string, body: DepartmentBody) {
    return this.departmentService.updateDepartment(id, body as any);
  }

  async deleteDepartment(id: string) {
    return this.departmentService.deleteDepartment(id);
  }

  // Employee Management
  async getEmployees(status?: string, departmentId?: string, search?: string) {
    return this.employeeService.getEmployees(status, departmentId, search);
  }

  async getEmployeeById(id: string) {
    return this.employeeService.getEmployeeById(id);
  }

  async createEmployee(body: EmployeeBody) {
    return this.employeeService.createEmployee(body as any);
  }

  async updateEmployee(id: string, body: Partial<EmployeeBody>) {
    return this.employeeService.updateEmployee(id, body as any);
  }

  async deleteEmployee(id: string) {
    return this.employeeService.deleteEmployee(id);
  }

  // Leave Management
  async getLeaveTypes() {
    return this.leaveService.getLeaveTypes();
  }

  async getLeaveRequests(employeeId?: string, isAdminOrHR?: boolean, currentUserId?: string) {
    return this.leaveService.getLeaveRequests(employeeId, isAdminOrHR, currentUserId);
  }

  async createLeaveRequest(body: any, isAdminOrHR: boolean, currentUserId: string) {
    return this.leaveService.createLeaveRequest(body, isAdminOrHR, currentUserId);
  }

  async updateLeaveRequest(id: string, body: any, isAdminOrHR: boolean, currentUserId: string) {
    return this.leaveService.updateLeaveRequest(id, body, isAdminOrHR, currentUserId);
  }
}
