import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, and, sql } from 'drizzle-orm';
import { reportDefinitions, reportRuns } from './schema.js';
import { NewReportRun, ReportFilters } from './types.js';

export class ReportService {
    constructor(
        private db: NodePgDatabase<any> | any,
        private agencyId: string
    ) { }

    async getReportDefinitions(filters?: ReportFilters) {
        const conditions = [eq(reportDefinitions.agencyId, this.agencyId)];
        
        if (filters?.module) {
            conditions.push(eq(reportDefinitions.module, filters.module));
        }
        if (filters?.isActive !== undefined) {
            conditions.push(eq(reportDefinitions.isActive, filters.isActive));
        }

        return await this.db.select().from(reportDefinitions).where(and(...conditions));
    }

    async getReportRuns() {
        return await this.db.select().from(reportRuns).where(eq(reportRuns.agencyId, this.agencyId));
    }

    async getReportRun(id: string) {
        const [run] = await this.db.select().from(reportRuns).where(and(eq(reportRuns.id, id), eq(reportRuns.agencyId, this.agencyId)));
        if (!run) throw new Error('Report run not found');
        return run;
    }

    async generateReport(reportId: string, parameters: any, format: string, userId: string) {
        // Enqueue job stub - actual processing done in a worker
        const [run] = await this.db.insert(reportRuns).values({
            agencyId: this.agencyId,
            reportId,
            runBy: userId,
            parameters,
            format,
            status: 'pending'
        }).returning();

        // In a real implementation, we would add the job to BullMQ here
        // e.g., await queue.add(reportJobs.GENERATE_REPORT, { runId: run.id });

        return run;
    }
}
