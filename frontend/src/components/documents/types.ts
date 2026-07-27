export interface DocumentFolder {
  id: string;
  name: string;
  description: string;
  parent_folder_id: string | null;
  created_by: string;
  agency_id: string;
  created_at: string;
}

export interface Document {
  id: string;
  name: string;
  description: string;
  file_path: string;
  file_size: number;
  file_type: string;
  uploaded_by: string;
  folder_id: string | null;
  tags: string[];
  is_public: boolean;
  download_count: number;
  agency_id: string;
  created_at: string;
  updated_at: string;
}

export interface DocumentVersion {
  id: string;
  document_id: string;
  version_number: number;
  file_path: string;
  uploaded_by: string;
  upload_date: string;
  change_summary: string;
  is_current: boolean;
}

export interface DocumentPermission {
  id: string;
  document_id: string;
  user_id: string;
  role: string;
  permission_type: 'read' | 'write' | 'admin';
  granted_by: string;
  created_at: string;
}

export type ViewMode = 'grid' | 'list';

export interface FolderForm {
  name: string;
  description: string;
}
