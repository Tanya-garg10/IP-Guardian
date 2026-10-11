export type IPType = 'Patent' | 'Trademark' | 'Copyright';

export type ApplicationStatus =
  | 'Idea'
  | 'Draft'
  | 'Filed'
  | 'Under Review'
  | 'Approved'
  | 'Rejected';

export interface DocumentRecord {
  id: string;
  ip_record: string; // Foreign key to IPRecord.id
  filename: string;
  stored_filename: string;
  file_type: string;
  file_size: number;
  upload_date: string; // ISO 8601
  storage_reference: string;
  description?: string;
}

export interface ActivityRecord {
  id: string;
  record_id: string;
  action: string;
  description: string;
  timestamp: string; // ISO 8601
  user: string;
  user_role: 'Inventor' | 'Coordinator' | 'Reviewer' | 'Administrator';
}

export interface IPRecord {
  id: string;
  title: string;
  ip_type: IPType;
  description: string;
  inventor_name: string;
  owner_name: string;
  application_number: string;
  filing_date: string; // YYYY-MM-DD
  application_status: ApplicationStatus;
  next_deadline: string | null; // YYYY-MM-DD or null
  deadline_completed?: boolean;
  notes: string;
  created_at: string; // ISO 8601
  updated_at: string; // ISO 8601
  created_by: string;
}

export interface DatabaseSchema {
  records: IPRecord[];
  documents: DocumentRecord[];
  activities: ActivityRecord[];
  meta: {
    last_updated: string;
    version: string;
  };
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
  days_remaining: number | null; // negative means overdue
  urgency: DeadlineUrgency;
  deadline_completed: boolean;
  notes?: string;
}

export interface CompletenessBreakdown {
  score: number; // 0 - 100
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
  overall_completeness: number; // average portfolio score (0-100)
}
