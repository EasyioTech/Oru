export interface Notification {
  id: string;
  user_id: string;
  type: 'email' | 'in_app' | 'push';
  category: 'approval' | 'reminder' | 'update' | 'alert' | 'system';
  title: string;
  message: string;
  metadata: unknown;
  read_at: string | null;
  sent_at: string | null;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  expires_at: string | null;
  action_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface NotificationUser {
  id: string;
  email: string;
  full_name?: string;
}

export interface SendForm {
  userIds: string[];
  type: 'email' | 'in_app' | 'push';
  category: 'approval' | 'reminder' | 'update' | 'alert' | 'system';
  title: string;
  message: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  actionUrl: string;
  expiresAt: string;
}

export const DEFAULT_SEND_FORM: SendForm = {
  userIds: [],
  type: 'in_app',
  category: 'system',
  title: '',
  message: '',
  priority: 'normal',
  actionUrl: '',
  expiresAt: '',
};
