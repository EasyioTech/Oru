import { BaseApiService } from '../../core/base';
import { getAgencyId as fetchAgencyId } from '@/utils/agencyUtils';
import { selectRecords, selectOne, insertRecord, updateRecord, deleteRecord } from '../../core';

export abstract class BaseProjectService extends BaseApiService {
  /**
   * Get agency ID from auth context
   */
  protected async fetchAgencyId(profile: unknown, userId: string | null | undefined): Promise<string> {
    const agencyId = await getAgencyId(profile, userId);
    if (!agencyId) {
      throw new Error('Agency ID not found. Please ensure you are logged in.');
    }
    return agencyId;
  }

  /**
   * Generate project code
   */
  protected async generateProjectCode(agencyId: string): Promise<string> {
    const year = new Date().getFullYear();
    const projects = await selectRecords('projects', {
      where: { agency_id: agencyId },
      filters: [
        { column: 'project_code', operator: 'like', value: `PRJ-${year}-%` }
      ]
    });
    
    const nextNumber = (projects.length || 0) + 1;
    return `PRJ-${year}-${String(nextNumber).padStart(4, '0')}`;
  }

  /**
   * Projects CRUD
}
