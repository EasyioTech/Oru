import { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { reportDefinitions, reportRuns } from './schema.js';

export type ReportDefinition = InferSelectModel<typeof reportDefinitions>;
export type NewReportDefinition = InferInsertModel<typeof reportDefinitions>;

export type ReportRun = InferSelectModel<typeof reportRuns>;
export type NewReportRun = InferInsertModel<typeof reportRuns>;

export interface ReportFilters {
    module?: string;
    isActive?: boolean;
}
