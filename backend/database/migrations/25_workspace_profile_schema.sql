CREATE TABLE IF NOT EXISTS public.workspace_profiles (
  workspace_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  modules_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  collaboration_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  adoption_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  health_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  recommendations_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  quick_wins_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.workspace_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES public.workspace_profiles(workspace_id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  module TEXT,
  action TEXT NOT NULL,
  metadata_json JSONB,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);