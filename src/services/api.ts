import {
  IPRecord,
  DocumentRecord,
  AnalyticsSummary,
  DeadlineItem,
  UserProfile,
  ActivityRecord,
  CompletenessBreakdown,
  AiAssistantResponse,
  UserRole
} from '../types/ip';

const BASE_URL = '/api';

export async function fetchRecords(params?: {
  search?: string;
  type?: string;
  status?: string;
  owner?: string;
  sort?: string;
  page?: number;
  limit?: number;
}): Promise<{ records: IPRecord[]; total: number; page: number; total_pages: number }> {
  const query = new URLSearchParams();
  if (params?.search) query.set('q', params.search);
  if (params?.type && params.type !== 'all') query.set('type', params.type);
  if (params?.status && params.status !== 'all') query.set('status', params.status);
  if (params?.owner && params.owner !== 'all') query.set('owner', params.owner);
  if (params?.sort) query.set('sort', params.sort);
  if (params?.page) query.set('page', params.page.toString());
  if (params?.limit) query.set('limit', params.limit.toString());

  const res = await fetch(`${BASE_URL}/records?${query.toString()}`);
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to fetch IP records');
  }
  return res.json();
}

export async function fetchRecordById(id: string): Promise<{
  record: IPRecord;
  documents: DocumentRecord[];
  activities: ActivityRecord[];
  completeness: CompletenessBreakdown;
}> {
  const res = await fetch(`${BASE_URL}/records/${id}`);
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error || `Failed to fetch record ${id}`);
  }
  return res.json();
}

export async function toggleTaskCompletion(recordId: string): Promise<{ success: boolean; completed: boolean; record: IPRecord }> {
  const res = await fetch(`${BASE_URL}/records/${recordId}/toggle-task`, {
    method: 'POST'
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to toggle task');
  }
  return res.json();
}

export async function createRecord(data: {
  title: string;
  ip_type: string;
  description: string;
  inventor_name: string;
  owner_name: string;
  application_number: string;
  filing_date: string;
  application_status: string;
  next_deadline?: string | null;
  notes?: string;
  author_name?: string;
  author_role?: UserRole;
}): Promise<{ success: boolean; record: IPRecord }> {
  const res = await fetch(`${BASE_URL}/records`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error || (json.fields ? Object.values(json.fields).join(', ') : 'Failed to create record'));
  }
  return json;
}

export async function updateRecord(
  id: string,
  data: Partial<Omit<IPRecord, 'id' | 'created_at' | 'updated_at'>> & {
    author_name?: string;
    author_role?: UserRole;
  }
): Promise<{ success: boolean; record: IPRecord }> {
  const res = await fetch(`${BASE_URL}/records/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error || 'Failed to update record');
  }
  return json;
}

export async function deleteRecord(id: string): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${BASE_URL}/records/${id}`, {
    method: 'DELETE',
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error || 'Failed to delete record');
  }
  return json;
}

export async function uploadDocument(
  recordId: string,
  file: File,
  description?: string,
  authorName?: string,
  authorRole?: UserRole
): Promise<{ success: boolean; document: DocumentRecord }> {
  const formData = new FormData();
  formData.append('file', file);
  if (description) formData.append('description', description);
  if (authorName) formData.append('author_name', authorName);
  if (authorRole) formData.append('author_role', authorRole);

  const res = await fetch(`${BASE_URL}/records/${recordId}/documents`, {
    method: 'POST',
    body: formData,
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error || 'Failed to upload document');
  }
  return json;
}

export async function fetchAllDocuments(): Promise<{ documents: DocumentRecord[]; total: number }> {
  const res = await fetch(`${BASE_URL}/documents`);
  if (!res.ok) {
    throw new Error('Failed to retrieve documents');
  }
  return res.json();
}

export async function deleteDocument(docId: string): Promise<{ success: boolean }> {
  const res = await fetch(`${BASE_URL}/documents/${docId}`, {
    method: 'DELETE',
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error || 'Failed to delete document');
  }
  return json;
}

export function getDocumentDownloadUrl(docId: string): string {
  return `${BASE_URL}/documents/${docId}/download`;
}

export async function fetchAnalytics(): Promise<AnalyticsSummary> {
  const res = await fetch(`${BASE_URL}/analytics`);
  if (!res.ok) {
    throw new Error('Failed to fetch analytics');
  }
  return res.json();
}

export async function fetchDeadlines(refDate?: string): Promise<{ items: DeadlineItem[]; reference_date: string; total: number }> {
  const url = refDate ? `${BASE_URL}/deadlines?ref_date=${refDate}` : `${BASE_URL}/deadlines`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('Failed to fetch deadlines');
  }
  return res.json();
}

export async function resetDemoData(): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${BASE_URL}/reset-demo`, {
    method: 'POST',
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error || 'Failed to reset demo data');
  }
  return json;
}

export async function fetchCurrentUser(role?: UserRole): Promise<{ user: UserProfile }> {
  const url = role ? `${BASE_URL}/auth/current-user?role=${role}` : `${BASE_URL}/auth/current-user`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('Failed to fetch user profile');
  }
  return res.json();
}

export async function callAiAssistant(payload: {
  action: 'summarize' | 'extract' | 'checklist' | 'explain_field';
  text?: string;
  record_id?: string;
  field_name?: string;
}): Promise<AiAssistantResponse> {
  const res = await fetch(`${BASE_URL}/ai/assistant`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error('AI assistant call failed');
  }
  return res.json();
}

export function getPortfolioExportCsvUrl(): string {
  return `${BASE_URL}/records/export/csv`;
}
