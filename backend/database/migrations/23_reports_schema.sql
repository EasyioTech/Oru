-- Reports module tables

CREATE TABLE IF NOT EXISTS report_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  module TEXT,
  type TEXT NOT NULL DEFAULT 'table',
  config JSONB DEFAULT '{}',
  is_system BOOLEAN NOT NULL DEFAULT false,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS report_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id UUID NOT NULL,
  definition_id UUID NOT NULL REFERENCES report_definitions(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending',
  parameters JSONB DEFAULT '{}',
  result_url TEXT,
  error_message TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  triggered_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_report_definitions_agency ON report_definitions(agency_id);
CREATE INDEX IF NOT EXISTS idx_report_runs_agency ON report_runs(agency_id);
CREATE INDEX IF NOT EXISTS idx_report_runs_definition ON report_runs(definition_id);
