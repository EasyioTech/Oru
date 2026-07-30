import { selectRecords, selectOne, insertRecord, updateRecord, deleteRecord } from '../../core';
import { ProjectCoreService } from './core';
import { Project, Task, TaskAssignment, TaskComment, TimeTracking, ProjectFilters, TaskFilters } from './types';

export class ProjectExtendedService extends ProjectCoreService {
  static async getProjectWithClient(id: string, profile?: any, userId?: string | null): Promise<Project | null> {
    const project = await this.getProject(id, profile, userId);
    if (!project || !project.client_id) return project;

    const agencyId = await this.getAgencyId(profile, userId);
    const clientResult = await selectOne('clients', { id: project.client_id, agency_id: agencyId });
    
    if (clientResult && clientResult.success && clientResult.data) {
      const client = clientResult.data;
      return {
        ...project,
        client: {
          id: client.id,
          name: client.name,
          company_name: client.company_name,
          email: client.email,
          phone: client.phone,
          contact_person: client.contact_person,
          contact_email: client.contact_email,
          contact_phone: client.contact_phone,
          address: client.address,
          payment_terms: client.payment_terms,
          industry: client.industry,
          status: client.status
        }
      };
    }

    return project;
  }

  /**
   * Get project with financial summary (invoices, payments, revenue)
   */
  static async getProjectWithFinancials(id: string, profile?: any, userId?: string | null): Promise<Project & { financials?: any } | null> {
    const project = await this.getProject(id, profile, userId);
    if (!project) return null;

    const agencyId = await this.getAgencyId(profile, userId);
    
    // Fetch invoices for client (if project has client)
    let financials: any = {
      totalInvoiced: 0,
      totalPaid: 0,
      outstanding: 0,
      invoiceCount: 0
    };

    if (project.client_id) {
      try {
        const invoicesResult = await selectRecords('invoices', {
          filters: [
            { column: 'agency_id', operator: 'eq', value: agencyId },
            { column: 'client_id', operator: 'eq', value: project.client_id }
          ],
          orderBy: 'issue_date DESC'
        });
        const invoices = invoicesResult && invoicesResult.success && invoicesResult.data ? invoicesResult.data : [];

        const totalInvoiced = invoices.reduce((sum: number, inv: any) => {
          return sum + (parseFloat(inv.total_amount) || 0);
        }, 0);

        const paidInvoices = invoices.filter((inv: any) => inv.status === 'paid' || inv.status === 'partial');
        const totalPaid = paidInvoices.reduce((sum: number, inv: any) => {
          return sum + (parseFloat(inv.total_amount) || 0);
        }, 0);

        financials = {
          totalInvoiced,
          totalPaid,
          outstanding: totalInvoiced - totalPaid,
          invoiceCount: invoices.length
        };
      } catch (error) {
        console.error('Error fetching project financials:', error);
      }
    }

    return {
      ...project,
      financials
    };
  }

  /**
   * Get all projects for a specific client
   */
  static async getProjectsByClient(clientId: string, profile?: any, userId?: string | null): Promise<Project[]> {
    return this.getProjects({ client_id: clientId }, profile, userId);
  }

  /**
   * Get all projects for a specific employee
   * Checks assigned_team, project_manager_id, and account_manager_id
   */
  static async getProjectsByEmployee(employeeId: string, profile?: any, userId?: string | null): Promise<Project[]> {
    const allProjects = await this.getProjects({}, profile, userId);
    
    return allProjects.filter((project: Project) => {
      // Check if employee is project manager or account manager
      if (project.project_manager_id === employeeId || project.account_manager_id === employeeId) {
        return true;
      }

      // Check if employee is in assigned_team
      if (project.assigned_team && Array.isArray(project.assigned_team)) {
        return project.assigned_team.some((member: any) => {
          const memberId = typeof member === 'string' ? member : member.user_id || member.id || String(member);
          return memberId === employeeId;
        });
      }

      return false;
    });
  }

  /**
   * Get project with team member details
   */
  static async getProjectWithTeam(id: string, profile?: any, userId?: string | null): Promise<Project & { teamDetails?: any[] } | null> {
    const project = await this.getProject(id, profile, userId);
    if (!project || !project.assigned_team || project.assigned_team.length === 0) {
      return project;
    }

    const agencyId = await this.getAgencyId(profile, userId);
    const teamMemberIds = project.assigned_team.map((m: any) => 
      typeof m === 'string' ? m : m.user_id || m.id || String(m)
    );

    try {
      const profilesResult = await selectRecords('profiles', {
        filters: [
          { column: 'agency_id', operator: 'eq', value: agencyId },
          { column: 'user_id', operator: 'in', value: teamMemberIds }
        ]
      });
      const profiles = profilesResult && profilesResult.success && profilesResult.data ? profilesResult.data : [];

      const teamDetails = profiles.map((p: any) => ({
        user_id: p.user_id,
        full_name: p.full_name,
        email: p.email,
        phone: p.phone,
        department: p.department,
        position: p.position,
        avatar_url: p.avatar_url
      }));

      return {
        ...project,
        teamDetails
      };
    } catch (error) {
      console.error('Error fetching team details:', error);
      return project;
    }
  }
}
