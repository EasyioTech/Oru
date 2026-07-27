SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('workspace_profiles', 'workspace_activity');
