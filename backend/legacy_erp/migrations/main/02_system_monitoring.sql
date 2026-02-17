CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$ BEGIN
    CREATE TYPE health_status_type AS ENUM ('healthy', 'degraded', 'down', 'maintenance');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE alert_severity AS ENUM ('info', 'warning', 'error', 'critical');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS public.system_health_metrics (
    id UUID DEFAULT gen_random_uuid(),
    timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (id, timestamp),
    overall_status health_status_type NOT NULL DEFAULT 'healthy',
    db_status health_status_type,
    db_response_time_ms INTEGER,
    db_size_bytes BIGINT,
    db_connections_active INTEGER,
    db_connections_idle INTEGER,
    db_connections_waiting INTEGER,
    db_connections_max INTEGER,
    db_connections_usage_percent NUMERIC(5,2),
    db_locks_count INTEGER,
    db_deadlocks_count INTEGER,
    db_cache_hit_ratio NUMERIC(5,2),
    db_index_usage_percent NUMERIC(5,2),
    db_table_count INTEGER,
    db_total_rows BIGINT,
    db_temp_files INTEGER,
    db_temp_bytes BIGINT,
    db_transaction_rate NUMERIC(10,2),
    db_query_rate NUMERIC(10,2),
    db_slow_queries INTEGER,
    redis_status health_status_type,
    redis_response_time_ms INTEGER,
    redis_memory_used_bytes BIGINT,
    redis_memory_peak_bytes BIGINT,
    redis_memory_fragmentation_ratio NUMERIC(5,2),
    redis_connected_clients INTEGER,
    redis_blocked_clients INTEGER,
    redis_commands_processed BIGINT,
    redis_keyspace_hits BIGINT,
    redis_keyspace_misses BIGINT,
    redis_hit_rate NUMERIC(5,2),
    redis_evicted_keys BIGINT,
    redis_expired_keys BIGINT,
    redis_cpu_usage_percent NUMERIC(5,2),
    system_platform TEXT,
    system_arch TEXT,
    system_node_version TEXT,
    system_uptime_seconds INTEGER,
    system_memory_total_bytes BIGINT,
    system_memory_used_bytes BIGINT,
    system_memory_free_bytes BIGINT,
    system_memory_usage_percent NUMERIC(5,2),
    system_cpu_count INTEGER,
    system_cpu_model TEXT,
    system_cpu_usage_percent NUMERIC(5,2),
    system_load_avg_1min NUMERIC(10,2),
    system_load_avg_5min NUMERIC(10,2),
    system_load_avg_15min NUMERIC(10,2),
    system_disk_total_bytes BIGINT,
    system_disk_used_bytes BIGINT,
    system_disk_free_bytes BIGINT,
    system_disk_usage_percent NUMERIC(5,2),
    process_memory_rss_bytes BIGINT,
    process_memory_heap_total_bytes BIGINT,
    process_memory_heap_used_bytes BIGINT,
    process_memory_heap_limit_bytes BIGINT,
    process_memory_external_bytes BIGINT,
    process_cpu_user_microseconds BIGINT,
    process_cpu_system_microseconds BIGINT,
    process_event_loop_lag_ms NUMERIC(10,2),
    api_response_time_avg_ms INTEGER,
    api_response_time_p50_ms INTEGER,
    api_response_time_p95_ms INTEGER,
    api_response_time_p99_ms INTEGER,
    api_requests_total INTEGER,
    api_requests_per_second NUMERIC(10,2),
    api_error_count INTEGER,
    api_error_rate_percent NUMERIC(5,2),
    api_timeout_count INTEGER,
    active_sessions INTEGER,
    active_websockets INTEGER,
    queue_length INTEGER,
    queue_processing_rate NUMERIC(10,2),
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
) PARTITION BY RANGE (timestamp);

CREATE INDEX IF NOT EXISTS idx_system_health_metrics_timestamp ON public.system_health_metrics(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_system_health_metrics_overall_status ON public.system_health_metrics(overall_status);
CREATE INDEX IF NOT EXISTS idx_system_health_metrics_db_status ON public.system_health_metrics(db_status);
CREATE INDEX IF NOT EXISTS idx_system_health_metrics_redis_status ON public.system_health_metrics(redis_status);

CREATE TABLE IF NOT EXISTS public.system_health_metrics_2026_01 PARTITION OF public.system_health_metrics
    FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');
CREATE TABLE IF NOT EXISTS public.system_health_metrics_2026_02 PARTITION OF public.system_health_metrics
    FOR VALUES FROM ('2026-02-01') TO ('2026-03-01');
CREATE TABLE IF NOT EXISTS public.system_health_metrics_2026_03 PARTITION OF public.system_health_metrics
    FOR VALUES FROM ('2026-03-01') TO ('2026-04-01');

CREATE TABLE IF NOT EXISTS public.system_alert_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rule_name TEXT NOT NULL UNIQUE,
    metric_name TEXT NOT NULL,
    condition TEXT NOT NULL,
    threshold_value NUMERIC(15,2) NOT NULL,
    comparison_operator TEXT NOT NULL CHECK (comparison_operator IN ('>', '>=', '<', '<=', '=', '!=')),
    severity alert_severity NOT NULL,
    duration_seconds INTEGER NOT NULL DEFAULT 60,
    cooldown_seconds INTEGER NOT NULL DEFAULT 300,
    notification_channels TEXT[] NOT NULL DEFAULT '{}',
    is_enabled BOOLEAN NOT NULL DEFAULT true,
    description TEXT,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_system_alert_rules_enabled ON public.system_alert_rules(is_enabled);
CREATE INDEX IF NOT EXISTS idx_system_alert_rules_metric ON public.system_alert_rules(metric_name) WHERE is_enabled = true;

CREATE TABLE IF NOT EXISTS public.system_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    alert_rule_id UUID REFERENCES public.system_alert_rules(id) ON DELETE SET NULL,
    severity alert_severity NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    metric_name TEXT,
    current_value NUMERIC(15,2),
    threshold_value NUMERIC(15,2),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'acknowledged', 'resolved', 'suppressed')),
    triggered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    acknowledged_at TIMESTAMPTZ,
    acknowledged_by UUID REFERENCES public.users(id),
    resolved_at TIMESTAMPTZ,
    resolved_by UUID REFERENCES public.users(id),
    resolution_notes TEXT,
    notification_sent BOOLEAN NOT NULL DEFAULT false,
    notification_sent_at TIMESTAMPTZ,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_system_alerts_status ON public.system_alerts(status);
CREATE INDEX IF NOT EXISTS idx_system_alerts_severity ON public.system_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_system_alerts_triggered_at ON public.system_alerts(triggered_at DESC);
CREATE INDEX IF NOT EXISTS idx_system_alerts_alert_rule_id ON public.system_alerts(alert_rule_id) WHERE alert_rule_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS public.system_incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    incident_number TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    severity alert_severity NOT NULL,
    status TEXT NOT NULL DEFAULT 'investigating' CHECK (status IN ('investigating', 'identified', 'monitoring', 'resolved')),
    affected_services TEXT[] NOT NULL DEFAULT '{}',
    started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    detected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    acknowledged_at TIMESTAMPTZ,
    resolved_at TIMESTAMPTZ,
    duration_seconds INTEGER,
    root_cause TEXT,
    resolution_summary TEXT,
    impact_description TEXT,
    affected_users_count INTEGER,
    created_by UUID REFERENCES public.users(id),
    assigned_to UUID REFERENCES public.users(id),
    related_alerts UUID[],
    timeline JSONB NOT NULL DEFAULT '[]'::jsonb,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_system_incidents_status ON public.system_incidents(status);
CREATE INDEX IF NOT EXISTS idx_system_incidents_severity ON public.system_incidents(severity);
CREATE INDEX IF NOT EXISTS idx_system_incidents_started_at ON public.system_incidents(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_system_incidents_assigned_to ON public.system_incidents(assigned_to) WHERE assigned_to IS NOT NULL;

CREATE TABLE IF NOT EXISTS public.system_sla_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    metric_date DATE NOT NULL,
    service_name TEXT NOT NULL,
    uptime_percentage NUMERIC(5,2) NOT NULL,
    downtime_minutes INTEGER NOT NULL DEFAULT 0,
    total_requests BIGINT NOT NULL DEFAULT 0,
    successful_requests BIGINT NOT NULL DEFAULT 0,
    failed_requests BIGINT NOT NULL DEFAULT 0,
    avg_response_time_ms NUMERIC(10,2),
    p95_response_time_ms NUMERIC(10,2),
    p99_response_time_ms NUMERIC(10,2),
    incident_count INTEGER NOT NULL DEFAULT 0,
    mttr_minutes NUMERIC(10,2),
    mttd_minutes NUMERIC(10,2),
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT unique_sla_metric_per_service_day UNIQUE (metric_date, service_name)
);

CREATE INDEX IF NOT EXISTS idx_system_sla_metrics_date ON public.system_sla_metrics(metric_date DESC);
CREATE INDEX IF NOT EXISTS idx_system_sla_metrics_service ON public.system_sla_metrics(service_name);

CREATE OR REPLACE FUNCTION public.cleanup_old_health_metrics(retention_days INTEGER DEFAULT 30)
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM public.system_health_metrics
    WHERE timestamp < now() - (retention_days || ' days')::INTERVAL;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE VIEW public.latest_system_health AS
SELECT *
FROM public.system_health_metrics
ORDER BY timestamp DESC
LIMIT 1;

CREATE MATERIALIZED VIEW IF NOT EXISTS public.system_health_hourly AS
SELECT 
    DATE_TRUNC('hour', timestamp) as hour,
    COUNT(*) as sample_count,
    AVG(db_response_time_ms)::INTEGER as avg_db_response_time_ms,
    MAX(db_response_time_ms) as max_db_response_time_ms,
    AVG(redis_response_time_ms)::INTEGER as avg_redis_response_time_ms,
    MAX(redis_response_time_ms) as max_redis_response_time_ms,
    AVG(system_memory_usage_percent)::NUMERIC(5,2) as avg_memory_usage_percent,
    MAX(system_memory_usage_percent) as max_memory_usage_percent,
    AVG(system_cpu_usage_percent)::NUMERIC(5,2) as avg_cpu_usage_percent,
    MAX(system_cpu_usage_percent) as max_cpu_usage_percent,
    AVG(db_connections_usage_percent)::NUMERIC(5,2) as avg_db_connections_usage_percent,
    MAX(db_connections_usage_percent) as max_db_connections_usage_percent,
    AVG(api_response_time_avg_ms)::INTEGER as avg_api_response_time_ms,
    AVG(api_error_rate_percent)::NUMERIC(5,2) as avg_error_rate_percent,
    SUM(CASE WHEN overall_status != 'healthy' THEN 1 ELSE 0 END) as unhealthy_count,
    MIN(overall_status::TEXT)::health_status_type as worst_status
FROM public.system_health_metrics
WHERE timestamp > now() - INTERVAL '30 days'
GROUP BY DATE_TRUNC('hour', timestamp);

CREATE UNIQUE INDEX IF NOT EXISTS idx_system_health_hourly_hour ON public.system_health_hourly(hour DESC);

DROP TRIGGER IF EXISTS update_system_alert_rules_updated_at ON public.system_alert_rules;
CREATE TRIGGER update_system_alert_rules_updated_at
    BEFORE UPDATE ON public.system_alert_rules
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_system_incidents_updated_at ON public.system_incidents;
CREATE TRIGGER update_system_incidents_updated_at
    BEFORE UPDATE ON public.system_incidents
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
