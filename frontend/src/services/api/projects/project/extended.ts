import { selectRecords, selectOne, insertRecord, updateRecord, deleteRecord } from '../../core';
import { Project, Task, TaskAssignment, TaskComment, TimeTracking, ProjectFilters, TaskFilters } from './types';

export class ProjectExtendedService extends BaseApiService {
  static async getProjectWithClient(id: string, profile?: unknown, userId?: string | null): Promise<Project | null> {
    const project = await this.getProject(id, profile, userId);
    if (!project || !project.client_id) return project;

    const agencyId = await this.getAgencyId(profile, userId);
    const client = await selectOne('clients', { id: project.client_id, agency_id: agencyId });
    
    if (client) {
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
  static async getProjectWithFinancials(id: string, profile?: unknown, userId?: string | null): Promise<Project & { financials?: unknown } | null> {
    const project = await this.getProject(id, profile, userId);
    if (!project) return null;

    const agencyId = await this.getAgencyId(profile, userId);
    
    // Fetch invoices for client (if project has client)
    let financials: unknown = {
      totalInvoiced: 0,
      totalPaid: 0,
      outstanding: 0,
      invoiceCount: 0
    };

    if (project.client_id) {
      try {
        const invoices = await selectRecords('invoices', {
          filters: [
            { column: 'agency_id', operator: 'eq', value: agencyId },
            { column: 'client_id', operator: 'eq', value: project.client_id }
          ],
          orderBy: 'issue_date DESC'
        });

        const totalInvoiced = invoices.reduce((sum: number, inv: unknown) => {
          return sum + (parseFloat(inv.total_amount) || 0);
        }, 0);

        const paidInvoices = invoices.filter((inv: unknown) => inv.status === 'paid' || inv.status === 'partial');
        const totalPaid = paidInvoices.reduce((sum: number, inv: unknown) => {
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
  static async getProjectsByClient(clientId: string, profile?: unknown, userId?: string | null): Promise<Project[]> {
    return this.getProjects({ client_id: clientId }, profile, userId);
  }

  /**
   * Get all projects for a specific employee
   * Checks assigned_team, project_manager_id, and account_manager_id
   */
  static async getProjectsByEmployee(employeeId: string, profile?: unknown, userId?: string | null): Promise<Project[]> {
    const allProjects = await this.getProjects({}, profile, userId);
    
    return allProjects.filter((project: Project) => {
      // Check if employee is project manager or account manager
      if (project.project_manager_id === employeeId || project.account_manager_id === employeeId) {
        return true;
      }

      // Check if employee is in assigned_team
      if (project.assigned_team && Array.isArray(project.assigned_team)) {
        return project.assigned_team.some((member: unknown) => {
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
  static async getProjectWithTeam(id: string, profile?: unknown, userId?: string | null): Promise<Project & { teamDetails?: unknown[] } | null> {
    const project = await this.getProject(id, profile, userId);
    if (!project || !project.assigned_team || project.assigned_team.length === 0) {
      return project;
    }

    const agencyId = await this.getAgencyId(profile, userId);
    const teamMemberIds = project.assigned_team.map((m: unknown) => 
      typeof m === 'string' ? m : m.user_id || m.id || String(m)
    );

    try {
      const profiles = await selectRecords('profiles', {
        filters: [
          { column: 'agency_id', operator: 'eq', value: agencyId },
          { column: 'user_id', operator: 'in', value: teamMemberIds }
        ]
      });

      const teamDetails = profiles.map((p: unknown) => ({
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
}
