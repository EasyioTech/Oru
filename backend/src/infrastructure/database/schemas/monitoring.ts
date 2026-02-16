
import { pgTable, uuid, text, boolean, timestamp, jsonb, integer, inet, index, decimal, bigint, uniqueIndex } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { healthStatusEnum, alertSeverityEnum, auditActionEnum } from './enums.js';
import { users } from './users.js';
import { agencies } from './agency.js';
import { userSessions } from './auth.js';

/**
 * System Health Metrics Table
 * Tracks vital system stats over time
 */
export const systemHealthMetrics = pgTable('system_health_metrics', {
    id: uuid('id').defaultRandom().primaryKey(),
    timestamp: timestamp('timestamp', { withTimezone: true }).defaultNow().notNull(),
    overallStatus: healthStatusEnum('overall_status').default('healthy').notNull(),

    // Database
    dbStatus: healthStatusEnum('db_status'),
    dbResponseTimeMs: integer('db_response_time_ms'),
    dbSizeBytes: bigint('db_size_bytes', { mode: 'number' }),
    dbConnectionsActive: integer('db_connections_active'),
    dbConnectionsIdle: integer('db_connections_idle'),
    dbConnectionsWaiting: integer('db_connections_waiting'),
    dbConnectionsMax: integer('db_connections_max'),
    dbConnectionsUsagePercent: decimal('db_connections_usage_percent', { precision: 5, scale: 2 }),
    dbLocksCount: integer('db_locks_count'),
    dbDeadlocksCount: integer('db_deadlocks_count'),
    dbCacheHitRatio: decimal('db_cache_hit_ratio', { precision: 5, scale: 2 }),
    dbIndexUsagePercent: decimal('db_index_usage_percent', { precision: 5, scale: 2 }),
    dbTableCount: integer('db_table_count'),
    dbTotalRows: bigint('db_total_rows', { mode: 'number' }),
    dbTempFiles: integer('db_temp_files'),
    dbTempBytes: bigint('db_temp_bytes', { mode: 'number' }),
    dbTransactionRate: decimal('db_transaction_rate', { precision: 10, scale: 2 }),
    dbQueryRate: decimal('db_query_rate', { precision: 10, scale: 2 }),
    dbSlowQueries: integer('db_slow_queries'),

    // Redis
    redisStatus: healthStatusEnum('redis_status'),
    redisResponseTimeMs: integer('redis_response_time_ms'),
    redisMemoryUsedBytes: bigint('redis_memory_used_bytes', { mode: 'number' }),
    redisMemoryPeakBytes: bigint('redis_memory_peak_bytes', { mode: 'number' }),
    redisMemoryFragmentationRatio: decimal('redis_memory_fragmentation_ratio', { precision: 5, scale: 2 }),
    redisConnectedClients: integer('redis_connected_clients'),
    redisBlockedClients: integer('redis_blocked_clients'),
    redisCommandsProcessed: bigint('redis_commands_processed', { mode: 'number' }),
    redisKeyspaceHits: bigint('redis_keyspace_hits', { mode: 'number' }),
    redisKeyspaceMisses: bigint('redis_keyspace_misses', { mode: 'number' }),
    redisHitRate: decimal('redis_hit_rate', { precision: 5, scale: 2 }),
    redisEvictedKeys: bigint('redis_evicted_keys', { mode: 'number' }),
    redisExpiredKeys: bigint('redis_expired_keys', { mode: 'number' }),
    redisCpuUsagePercent: decimal('redis_cpu_usage_percent', { precision: 5, scale: 2 }),

    // System
    systemPlatform: text('system_platform'),
    systemArch: text('system_arch'),
    systemNodeVersion: text('system_node_version'),
    systemUptimeSeconds: integer('system_uptime_seconds'),
    systemMemoryTotalBytes: bigint('system_memory_total_bytes', { mode: 'number' }),
    systemMemoryUsedBytes: bigint('system_memory_used_bytes', { mode: 'number' }),
    systemMemoryFreeBytes: bigint('system_memory_free_bytes', { mode: 'number' }),
    systemMemoryUsagePercent: decimal('system_memory_usage_percent', { precision: 5, scale: 2 }),
    systemCpuCount: integer('system_cpu_count'),
    systemCpuModel: text('system_cpu_model'),
    systemCpuUsagePercent: decimal('system_cpu_usage_percent', { precision: 5, scale: 2 }),
    systemLoadAvg1min: decimal('system_load_avg_1min', { precision: 10, scale: 2 }),
    systemLoadAvg5min: decimal('system_load_avg_5min', { precision: 10, scale: 2 }),
    systemLoadAvg15min: decimal('system_load_avg_15min', { precision: 10, scale: 2 }),
    systemDiskTotalBytes: bigint('system_disk_total_bytes', { mode: 'number' }),
    systemDiskUsedBytes: bigint('system_disk_used_bytes', { mode: 'number' }),
    systemDiskFreeBytes: bigint('system_disk_free_bytes', { mode: 'number' }),
    systemDiskUsagePercent: decimal('system_disk_usage_percent', { precision: 5, scale: 2 }),

    // Process
    processMemoryRssBytes: bigint('process_memory_rss_bytes', { mode: 'number' }),
    processMemoryHeapTotalBytes: bigint('process_memory_heap_total_bytes', { mode: 'number' }),
    processMemoryHeapUsedBytes: bigint('process_memory_heap_used_bytes', { mode: 'number' }),
    processMemoryHeapLimitBytes: bigint('process_memory_heap_limit_bytes', { mode: 'number' }),
    processMemoryExternalBytes: bigint('process_memory_external_bytes', { mode: 'number' }),
    processCpuUserMicroseconds: bigint('process_cpu_user_microseconds', { mode: 'number' }),
    processCpuSystemMicroseconds: bigint('process_cpu_system_microseconds', { mode: 'number' }),
    processEventLoopLagMs: decimal('process_event_loop_lag_ms', { precision: 10, scale: 2 }),

    // API Stats
    apiResponseTimeAvgMs: integer('api_response_time_avg_ms'),
    apiResponseTimeP50Ms: integer('api_response_time_p50_ms'),
    apiResponseTimeP95Ms: integer('api_response_time_p95_ms'),
    apiResponseTimeP99Ms: integer('api_response_time_p99_ms'),
    apiRequestsTotal: integer('api_requests_total'),
    apiRequestsPerSecond: decimal('api_requests_per_second', { precision: 10, scale: 2 }),
    apiErrorCount: integer('api_error_count'),
    apiErrorRatePercent: decimal('api_error_rate_percent', { precision: 5, scale: 2 }),
    apiTimeoutCount: integer('api_timeout_count'),

    // General
    activeSessions: integer('active_sessions'),
    activeWebsockets: integer('active_websockets'),
    queueLength: integer('queue_length'),
    queueProcessingRate: decimal('queue_processing_rate', { precision: 10, scale: 2 }),

    metadata: jsonb('metadata').default({}).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
    timestampIdx: index('idx_system_health_metrics_timestamp').on(table.timestamp),
    overallStatusIdx: index('idx_system_health_metrics_overall_status').on(table.overallStatus),
    dbStatusIdx: index('idx_system_health_metrics_db_status').on(table.dbStatus),
    redisStatusIdx: index('idx_system_health_metrics_redis_status').on(table.redisStatus),
}));

/**
 * System Alert Rules
 */
export const systemAlertRules = pgTable('system_alert_rules', {
    id: uuid('id').defaultRandom().primaryKey(),
    ruleName: text('rule_name').notNull().unique(),
    metricName: text('metric_name').notNull(),
    condition: text('condition').notNull(),
    thresholdValue: decimal('threshold_value', { precision: 15, scale: 2 }).notNull(),
    comparisonOperator: text('comparison_operator').notNull(), // >, >=, <, <=, =, !=
    severity: alertSeverityEnum('severity').notNull(),
    durationSeconds: integer('duration_seconds').default(60).notNull(),
    cooldownSeconds: integer('cooldown_seconds').default(300).notNull(),
    notificationChannels: text('notification_channels').array().default([]).notNull(),
    isEnabled: boolean('is_enabled').default(true).notNull(),
    description: text('description'),
    metadata: jsonb('metadata').default({}).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
    enabledIdx: index('idx_system_alert_rules_enabled').on(table.isEnabled),
    metricIdx: index('idx_system_alert_rules_metric').on(table.metricName).where(sql`is_enabled = true`),
}));

/**
 * System Alerts
 */
export const systemAlerts = pgTable('system_alerts', {
    id: uuid('id').defaultRandom().primaryKey(),
    alertRuleId: uuid('alert_rule_id').references(() => systemAlertRules.id, { onDelete: 'set null' }),
    severity: alertSeverityEnum('severity').notNull(),
    title: text('title').notNull(),
    message: text('message').notNull(),
    metricName: text('metric_name'),
    currentValue: decimal('current_value', { precision: 15, scale: 2 }),
    thresholdValue: decimal('threshold_value', { precision: 15, scale: 2 }),
    status: text('status').default('active').notNull(), // active, acknowledged, resolved, suppressed
    triggeredAt: timestamp('triggered_at', { withTimezone: true }).defaultNow().notNull(),
    acknowledgedAt: timestamp('acknowledged_at', { withTimezone: true }),
    acknowledgedBy: uuid('acknowledged_by').references(() => users.id),
    resolvedAt: timestamp('resolved_at', { withTimezone: true }),
    resolvedBy: uuid('resolved_by').references(() => users.id),
    resolutionNotes: text('resolution_notes'),
    notificationSent: boolean('notification_sent').default(false).notNull(),
    notificationSentAt: timestamp('notification_sent_at', { withTimezone: true }),
    metadata: jsonb('metadata').default({}).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
    statusIdx: index('idx_system_alerts_status').on(table.status),
    severityIdx: index('idx_system_alerts_severity').on(table.severity),
    triggeredAtIdx: index('idx_system_alerts_triggered_at').on(table.triggeredAt),
    alertRuleIdIdx: index('idx_system_alerts_alert_rule_id').on(table.alertRuleId),
}));

/**
 * System Incidents
 */
export const systemIncidents = pgTable('system_incidents', {
    id: uuid('id').defaultRandom().primaryKey(),
    incidentNumber: text('incident_number').notNull().unique(),
    title: text('title').notNull(),
    description: text('description').notNull(),
    severity: alertSeverityEnum('severity').notNull(),
    status: text('status').default('investigating').notNull(), // investigating, identified, monitoring, resolved
    affectedServices: text('affected_services').array().default([]).notNull(),
    startedAt: timestamp('started_at', { withTimezone: true }).defaultNow().notNull(),
    detectedAt: timestamp('detected_at', { withTimezone: true }).defaultNow().notNull(),
    acknowledgedAt: timestamp('acknowledged_at', { withTimezone: true }),
    resolvedAt: timestamp('resolved_at', { withTimezone: true }),
    durationSeconds: integer('duration_seconds'),
    rootCause: text('root_cause'),
    resolutionSummary: text('resolution_summary'),
    impactDescription: text('impact_description'),
    affectedUsersCount: integer('affected_users_count'),
    createdBy: uuid('created_by').references(() => users.id),
    assignedTo: uuid('assigned_to').references(() => users.id),
    relatedAlerts: uuid('related_alerts').array(),
    timeline: jsonb('timeline').default([]).notNull(),
    metadata: jsonb('metadata').default({}).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
    statusIdx: index('idx_system_incidents_status').on(table.status),
    severityIdx: index('idx_system_incidents_severity').on(table.severity),
    startedAtIdx: index('idx_system_incidents_started_at').on(table.startedAt),
    assignedToIdx: index('idx_system_incidents_assigned_to').on(table.assignedTo),
}));

/**
 * System SLA Metrics
 */
export const systemSlaMetrics = pgTable('system_sla_metrics', {
    id: uuid('id').defaultRandom().primaryKey(),
    metricDate: timestamp('metric_date', { mode: 'date' }).notNull(), // Changed from date to timestamp(mode date) to match Drizzle TS types better, or date string
    serviceName: text('service_name').notNull(),
    uptimePercentage: decimal('uptime_percentage', { precision: 5, scale: 2 }).notNull(),
    downtimeMinutes: integer('downtime_minutes').default(0).notNull(),
    totalRequests: bigint('total_requests', { mode: 'number' }).default(0).notNull(),
    successfulRequests: bigint('successful_requests', { mode: 'number' }).default(0).notNull(),
    failedRequests: bigint('failed_requests', { mode: 'number' }).default(0).notNull(),
    avgResponseTimeMs: decimal('avg_response_time_ms', { precision: 10, scale: 2 }),
    p95ResponseTimeMs: decimal('p95_response_time_ms', { precision: 10, scale: 2 }),
    p99ResponseTimeMs: decimal('p99_response_time_ms', { precision: 10, scale: 2 }),
    incidentCount: integer('incident_count').default(0).notNull(),
    mttrMinutes: decimal('mttr_minutes', { precision: 10, scale: 2 }),
    mttdMinutes: decimal('mttd_minutes', { precision: 10, scale: 2 }),
    metadata: jsonb('metadata').default({}).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
    dateIdx: index('idx_system_sla_metrics_date').on(table.metricDate),
    serviceIdx: index('idx_system_sla_metrics_service').on(table.serviceName),
    uniqueMetric: uniqueIndex('unique_sla_metric_per_service_day').on(table.metricDate, table.serviceName),
}));

/**
 * Audit Logs Table
 * System-wide audit trail
 */
export const auditLogs = pgTable('audit_logs', {
    id: uuid('id').defaultRandom().primaryKey(),
    agencyId: uuid('agency_id').references(() => agencies.id, { onDelete: 'cascade' }),
    userId: uuid('user_id').references(() => users.id),
    sessionId: uuid('session_id').references(() => userSessions.id),
    tableName: text('table_name').notNull(),
    recordId: uuid('record_id'),
    action: auditActionEnum('action').notNull(),
    oldValues: jsonb('old_values'),
    newValues: jsonb('new_values'),
    changedFields: text('changed_fields').array(),
    ipAddress: inet('ip_address'),
    userAgent: text('user_agent'),
    requestId: text('request_id'),
    endpoint: text('endpoint'),
    method: text('method'),
    statusCode: integer('status_code'),
    errorMessage: text('error_message'),
    metadata: jsonb('metadata').default({}).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
    agencyIdIdx: index('idx_audit_logs_agency_id').on(table.agencyId).where(sql`agency_id IS NOT NULL`),
    userIdIdx: index('idx_audit_logs_user_id').on(table.userId).where(sql`user_id IS NOT NULL`),
    sessionIdIdx: index('idx_audit_logs_session_id').on(table.sessionId).where(sql`session_id IS NOT NULL`),
    tableNameIdx: index('idx_audit_logs_table_name').on(table.tableName),
    recordIdIdx: index('idx_audit_logs_record_id').on(table.recordId).where(sql`record_id IS NOT NULL`),
    actionIdx: index('idx_audit_logs_action').on(table.action),
    createdAtIdx: index('idx_audit_logs_created_at').on(table.createdAt),
    tableRecordIdx: index('idx_audit_logs_table_record').on(table.tableName, table.recordId),
    requestIdIdx: index('idx_audit_logs_request_id').on(table.requestId).where(sql`request_id IS NOT NULL`),
}));
