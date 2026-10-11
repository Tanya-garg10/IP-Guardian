export type IPType = 'Patent' | 'Trademark' | 'Copyright';

export type ApplicationStatus =
  | 'Idea'
  | 'Draft'
  | 'Filed'
  | 'Under Review'
  | 'Approved'
  | 'Rejected';

export type UserRole = 'Inventor' | 'Coordinator' | 'Reviewer' | 'Administrator';

export interface DocumentRecord {
  id: string;
  ip_record: string;
  filename: string;
  stored_filename: string;
  file_type: string;
  file_size: number;
  upload_date: string;
  storage_reference: string;
  description?: string;
  record_title?: string;
  record_application_number?: string;
  record_type?: IPType;
}

export interface ActivityRecord {
  id: string;
  record_id: string;
  action: string;
  description: string;
  timestamp: string;
  user: string;
  user_role: UserRole;
}

export interface CompletenessBreakdown {
  score: number;
  title_valid: boolean;
  description_valid: boolean;
  inventor_valid: boolean;
  owner_valid: boolean;
  app_number_valid: boolean;
  deadline_set: boolean;
  document_attached: boolean;
  missing_items: { field: string; message: string; action_target: string }[];
  passed_items: string[];
}

export interface IPRecord {
  id: string;
  title: string;
  ip_type: IPType;
  description: string;
  inventor_name: string;
  owner_name: string;
  application_number: string;
  filing_date: string;
  application_status: ApplicationStatus;
  next_deadline: string | null;
  deadline_completed?: boolean;
  notes: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  completeness?: CompletenessBreakdown;
}

export type DeadlineUrgency = 'overdue' | 'due_soon' | 'upcoming' | 'none';

export interface DeadlineItem {
  record_id: string;
  title: string;
  ip_type: IPType;
  application_number: string;
  application_status: ApplicationStatus;
  owner_name: string;
  inventor_name: string;
  deadline_date: string | null;
  days_remaining: number | null;
  urgency: DeadlineUrgency;
  deadline_completed: boolean;
  notes?: string;
}

export interface AnalyticsSummary {
  total_records: number;
  by_type: {
    patents: number;
    trademarks: number;
    copyrights: number;
  };
  by_status: {
    idea: number;
    draft: number;
    filed: number;
    under_review: number;
    approved: number;
    rejected: number;
  };
  deadlines: {
    overdue: number;
    due_soon: number;
    upcoming: number;
    completed: number;
    none: number;
  };
  recent_records: IPRecord[];
  total_documents: number;
  overall_completeness: number;
}

export interface WorkspaceItem {
  id: string;
  name: string;
  role: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  organization: string;
  workspace_name: string;
  workspaces: WorkspaceItem[];
  permissions: string[];
}

export interface AiAssistantResponse {
  ai_mode: 'live_featherless' | 'simulated_fallback' | 'error_fallback';
  model?: string;
  notice?: string;
  disclaimer: string;
  result: string;
}
