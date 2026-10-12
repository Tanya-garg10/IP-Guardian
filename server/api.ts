import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { db, UPLOADS_DIR } from './db.js';
import { IPType, ApplicationStatus } from './types.js';

export const apiRouter = Router();

// Configure Multer for secure file uploads
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
    const ext = path.extname(file.originalname);
    const safeBase = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    cb(null, `${safeBase}-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (_req, file, cb) => {
    const allowedMimes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'text/csv',
      'image/png',
      'image/jpeg',
      'image/webp'
    ];
    if (allowedMimes.includes(file.mimetype) || file.originalname.match(/\.(pdf|doc|docx|txt|csv|png|jpg|jpeg|webp)$/i)) {
      cb(null, true);
    } else {
      cb(new Error('Unsupported file format. Please upload PDF, Word document, plain text, or image files.'));
    }
  }
});

// Current user profile with role context
apiRouter.get('/auth/current-user', (req: Request, res: Response) => {
  const activeRole = (req.query.role as string) || 'Coordinator';

  res.json({
    user: {
      id: 'usr-sarah-lin-2026',
      email: 'director@university-techtransfer.org',
      name: 'Dr. Sarah Lin',
      role: activeRole, // Inventor | Coordinator | Reviewer | Administrator
      organization: 'Apex University Technology Transfer Office',
      workspace_name: 'Apex Innovation Command Center',
      workspaces: [
        { id: 'ws-apex', name: 'Apex University Innovation Hub', role: 'Director' },
        { id: 'ws-stjude', name: 'St. Jude Clinical Tech Transfer', role: 'Consultant' },
        { id: 'ws-bionexus', name: 'BioNexus Student Incubator', role: 'Mentor' }
      ],
      permissions: ['read', 'write', 'delete', 'export', 'review']
    }
  });
});

// Health check
apiRouter.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    engine: 'Express 4.x + JSON-Atomic Persistence',
    ai_status: Boolean(process.env.FEATHERLESS_API_KEY) ? 'configured' : 'fallback_mode',
    database_status: 'ready'
  });
});

// GET /api/records - Search, filter, sort, paginate
apiRouter.get('/records', (req: Request, res: Response) => {
  try {
    let records = db.getAllRecords();

    const search = ((req.query.q || req.query.search || '') as string).toLowerCase().trim();
    const type = (req.query.type as string || '').trim();
    const status = (req.query.status as string || '').trim();
    const sort = (req.query.sort as string || 'date_desc').trim();
    const owner = (req.query.owner as string || '').trim();

    if (search) {
      records = records.filter(r =>
        r.title.toLowerCase().includes(search) ||
        r.inventor_name.toLowerCase().includes(search) ||
        r.owner_name.toLowerCase().includes(search) ||
        r.application_number.toLowerCase().includes(search) ||
        r.description.toLowerCase().includes(search) ||
        r.notes.toLowerCase().includes(search)
      );
    }

    if (type && type !== 'all' && type !== 'All') {
      records = records.filter(r => r.ip_type.toLowerCase() === type.toLowerCase());
    }

    if (status && status !== 'all' && status !== 'All') {
      records = records.filter(r => r.application_status.toLowerCase() === status.toLowerCase());
    }

    if (owner && owner !== 'all') {
      records = records.filter(r => r.owner_name.toLowerCase().includes(owner.toLowerCase()));
    }

    records.sort((a, b) => {
      if (sort === 'date_asc') {
        return new Date(a.filing_date).getTime() - new Date(b.filing_date).getTime();
      }
      if (sort === 'title_asc') {
        return a.title.localeCompare(b.title);
      }
      if (sort === 'deadline_asc') {
        if (!a.next_deadline) return 1;
        if (!b.next_deadline) return -1;
        return new Date(a.next_deadline).getTime() - new Date(b.next_deadline).getTime();
      }
      if (sort === 'updated_desc') {
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      }
      return new Date(b.filing_date).getTime() - new Date(a.filing_date).getTime();
    });

    const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit as string, 10) || 20));
    const total = records.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const paginated = records.slice((page - 1) * limit, page * limit);

    // Enrich with completeness scores
    const enriched = paginated.map(r => ({
      ...r,
      completeness: db.calculateRecordCompleteness(r)
    }));

    res.json({
      records: enriched,
      total,
      page,
      limit,
      total_pages: totalPages
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve IP records', details: err.message });
  }
});

// GET /api/records/export/csv - Stream real CSV export
apiRouter.get('/records/export/csv', (_req: Request, res: Response) => {
  try {
    const records = db.getAllRecords();
    const headers = [
      'ID',
      'Title',
      'IP Type',
      'Application Number',
      'Status',
      'Inventor(s)',
      'Owner / Organization',
      'Filing Date',
      'Next Deadline',
      'Task Completed',
      'Notes',
      'Created At'
    ];

    const escapeCsv = (val: string | null | undefined | boolean) => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = records.map(r => [
      escapeCsv(r.id),
      escapeCsv(r.title),
      escapeCsv(r.ip_type),
      escapeCsv(r.application_number),
      escapeCsv(r.application_status),
      escapeCsv(r.inventor_name),
      escapeCsv(r.owner_name),
      escapeCsv(r.filing_date),
      escapeCsv(r.next_deadline),
      escapeCsv(Boolean(r.deadline_completed)),
      escapeCsv(r.notes),
      escapeCsv(r.created_at)
    ]);

    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="IP_Guardian_Portfolio_Export_${new Date().toISOString().split('T')[0]}.csv"`);
    res.send(csvContent);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to generate CSV export', details: err.message });
  }
});

// GET /api/records/:id - Details with attached documents, activities, and completeness
apiRouter.get('/records/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const record = db.getRecordById(id);
  if (!record) {
    return res.status(404).json({ error: `IP record with id "${id}" was not found.` });
  }
  const documents = db.getDocumentsForRecord(id);
  const activities = db.getActivitiesForRecord(id);
  const completeness = db.calculateRecordCompleteness(record);

  res.json({
    record,
    documents,
    activities,
    completeness
  });
});

// POST /api/records/:id/toggle-task - Mark task completed or reopen
apiRouter.post('/records/:id/toggle-task', (req: Request, res: Response) => {
  const { id } = req.params;
  const result = db.toggleDeadlineCompletion(id);
  if (!result.record) {
    return res.status(404).json({ error: `Record with id "${id}" not found.` });
  }
  res.json({
    success: true,
    completed: result.completed,
    record: result.record
  });
});

// POST /api/records - Create a new record with validation
apiRouter.post('/records', (req: Request, res: Response) => {
  const {
    title,
    ip_type,
    description,
    inventor_name,
    owner_name,
    application_number,
    filing_date,
    application_status,
    next_deadline,
    notes,
    author_name,
    author_role
  } = req.body;

  const errors: Record<string, string> = {};

  if (!title || typeof title !== 'string' || title.trim().length < 3) {
    errors.title = 'Title must be at least 3 characters long.';
  }

  const validTypes: IPType[] = ['Patent', 'Trademark', 'Copyright'];
  if (!ip_type || !validTypes.includes(ip_type)) {
    errors.ip_type = 'IP Type must be Patent, Trademark, or Copyright.';
  }

  if (!description || typeof description !== 'string' || description.trim().length < 5) {
    errors.description = 'Please provide a descriptive overview of the invention or mark.';
  }

  if (!inventor_name || typeof inventor_name !== 'string' || inventor_name.trim().length === 0) {
    errors.inventor_name = 'Inventor/Author name is required.';
  }

  if (!owner_name || typeof owner_name !== 'string' || owner_name.trim().length === 0) {
    errors.owner_name = 'Owner organization or institution is required.';
  }

  if (!application_number || typeof application_number !== 'string' || application_number.trim().length === 0) {
    errors.application_number = 'Application or internal reference number is required.';
  }

  if (!filing_date || !/^\d{4}-\d{2}-\d{2}$/.test(filing_date)) {
    errors.filing_date = 'Filing date is required and must follow YYYY-MM-DD format.';
  }

  const validStatuses: ApplicationStatus[] = ['Idea', 'Draft', 'Filed', 'Under Review', 'Approved', 'Rejected'];
  if (!application_status || !validStatuses.includes(application_status)) {
    errors.application_status = `Status must be one of: ${validStatuses.join(', ')}.`;
  }

  if (next_deadline && next_deadline !== '' && !/^\d{4}-\d{2}-\d{2}$/.test(next_deadline)) {
    errors.next_deadline = 'Next deadline must follow YYYY-MM-DD format if provided.';
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      error: 'Validation failed for IP record submission.',
      fields: errors
    });
  }

  const newRecord = db.createRecord(
    {
      title: title.trim(),
      ip_type,
      description: description.trim(),
      inventor_name: inventor_name.trim(),
      owner_name: owner_name.trim(),
      application_number: application_number.trim(),
      filing_date,
      application_status,
      next_deadline: next_deadline && next_deadline.trim() !== '' ? next_deadline : null,
      notes: (notes || '').trim(),
      created_by: author_name || 'Dr. Sarah Lin'
    },
    author_name || 'Dr. Sarah Lin',
    (author_role as any) || 'Coordinator'
  );

  res.status(201).json({
    success: true,
    message: 'IP record created successfully',
    record: newRecord
  });
});

// PUT /api/records/:id - Update existing record
apiRouter.put('/records/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const existing = db.getRecordById(id);
  if (!existing) {
    return res.status(404).json({ error: `IP record with id "${id}" was not found.` });
  }

  const {
    title,
    ip_type,
    description,
    inventor_name,
    owner_name,
    application_number,
    filing_date,
    application_status,
    next_deadline,
    notes,
    author_name,
    author_role
  } = req.body;

  const errors: Record<string, string> = {};

  if (title !== undefined && (typeof title !== 'string' || title.trim().length < 3)) {
    errors.title = 'Title must be at least 3 characters.';
  }

  const validTypes: IPType[] = ['Patent', 'Trademark', 'Copyright'];
  if (ip_type !== undefined && !validTypes.includes(ip_type)) {
    errors.ip_type = 'Invalid IP Type.';
  }

  const validStatuses: ApplicationStatus[] = ['Idea', 'Draft', 'Filed', 'Under Review', 'Approved', 'Rejected'];
  if (application_status !== undefined && !validStatuses.includes(application_status)) {
    errors.application_status = 'Invalid Application Status.';
  }

  if (next_deadline && next_deadline !== '' && !/^\d{4}-\d{2}-\d{2}$/.test(next_deadline)) {
    errors.next_deadline = 'Next deadline must follow YYYY-MM-DD format.';
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ error: 'Validation failed', fields: errors });
  }

  const updated = db.updateRecord(
    id,
    {
      ...(title !== undefined ? { title: title.trim() } : {}),
      ...(ip_type !== undefined ? { ip_type } : {}),
      ...(description !== undefined ? { description: description.trim() } : {}),
      ...(inventor_name !== undefined ? { inventor_name: inventor_name.trim() } : {}),
      ...(owner_name !== undefined ? { owner_name: owner_name.trim() } : {}),
      ...(application_number !== undefined ? { application_number: application_number.trim() } : {}),
      ...(filing_date !== undefined ? { filing_date } : {}),
      ...(application_status !== undefined ? { application_status } : {}),
      ...(next_deadline !== undefined ? { next_deadline: next_deadline && next_deadline.trim() !== '' ? next_deadline : null } : {}),
      ...(notes !== undefined ? { notes: notes.trim() } : {})
    },
    author_name || 'Dr. Sarah Lin',
    (author_role as any) || 'Coordinator'
  );

  res.json({
    success: true,
    message: 'IP record updated successfully',
    record: updated
  });
});

// DELETE /api/records/:id - Delete record and its documents
apiRouter.delete('/records/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const success = db.deleteRecord(id);
  if (!success) {
    return res.status(404).json({ error: `Record with id "${id}" was not found.` });
  }
  res.json({ success: true, message: `IP record "${id}" and associated documents deleted successfully.` });
});

// GET /api/records/:id/documents - Get documents for a specific record
apiRouter.get('/records/:id/documents', (req: Request, res: Response) => {
  const { id } = req.params;
  const docs = db.getDocumentsForRecord(id);
  res.json({ documents: docs });
});

// POST /api/records/:id/documents - Upload a document for a record
apiRouter.post('/records/:id/documents', (req: Request, res: Response) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: err.message || 'File upload error.' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file was provided in the upload request.' });
    }

    const { id } = req.params;
    const record = db.getRecordById(id);
    if (!record) {
      try {
        fs.unlinkSync(req.file.path);
      } catch {
        // ignore
      }
      return res.status(404).json({ error: `IP record with id "${id}" does not exist.` });
    }

    const description = (req.body.description || '').trim();
    const authorName = req.body.author_name || 'Dr. Sarah Lin';
    const authorRole = req.body.author_role || 'Coordinator';

    const newDoc = db.addDocument(
      {
        ip_record: id,
        filename: req.file.originalname,
        stored_filename: req.file.filename,
        file_type: req.file.mimetype || 'application/octet-stream',
        file_size: req.file.size,
        storage_reference: req.file.filename,
        description
      },
      authorName,
      authorRole as any
    );

    res.status(201).json({
      success: true,
      message: 'Document uploaded and securely associated with record.',
      document: newDoc
    });
  });
});

// GET /api/documents - List all documents across all records
apiRouter.get('/documents', (_req: Request, res: Response) => {
  const docs = db.getAllDocuments();
  const records = db.getAllRecords();
  const recordMap = new Map(records.map(r => [r.id, r]));

  const enriched = docs.map(d => ({
    ...d,
    record_title: recordMap.get(d.ip_record)?.title || 'Unknown Record',
    record_application_number: recordMap.get(d.ip_record)?.application_number || 'N/A',
    record_type: recordMap.get(d.ip_record)?.ip_type || 'Unknown'
  }));

  res.json({ documents: enriched, total: enriched.length });
});

// GET /api/documents/:id/download - Stream secure download
apiRouter.get('/documents/:id/download', (req: Request, res: Response) => {
  const { id } = req.params;
  const doc = db.getDocumentById(id);
  if (!doc) {
    return res.status(404).json({ error: 'Document record not found.' });
  }

  const filePath = path.join(UPLOADS_DIR, doc.stored_filename);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'The requested file could not be located in secure storage.' });
  }

  res.setHeader('Content-Type', doc.file_type);
  res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(doc.filename)}"`);
  res.sendFile(filePath);
});

// DELETE /api/documents/:id - Delete document
apiRouter.delete('/documents/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const success = db.deleteDocument(id);
  if (!success) {
    return res.status(404).json({ error: 'Document was not found.' });
  }
  res.json({ success: true, message: 'Document removed from storage successfully.' });
});

// GET /api/analytics - Aggregated live metrics from records
apiRouter.get('/analytics', (_req: Request, res: Response) => {
  try {
    const summary = db.getAnalyticsSummary();
    res.json(summary);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to calculate analytics', details: err.message });
  }
});

// GET /api/deadlines - Deadline calculations & urgency status
apiRouter.get('/deadlines', (req: Request, res: Response) => {
  try {
    const refDate = (req.query.ref_date as string) || '2026-10-11';
    const items = db.getDeadlineItems(refDate);
    res.json({
      items,
      reference_date: refDate,
      total: items.length
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to compute deadlines', details: err.message });
  }
});

// POST /api/reset-demo - Safe reset to sample dataset
apiRouter.post('/reset-demo', (_req: Request, res: Response) => {
  try {
    db.resetDemoData();
    res.json({
      success: true,
      message: 'Demo dataset restored to initial state with sample patents, trademarks, copyrights, deadlines, and documents.'
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to reset demo dataset', details: err.message });
  }
});

// ==========================================
// 7. AI IP ASSISTANT (Featherless — Qwen2.5-72B-Instruct)
// =========================================================
apiRouter.post('/ai/assistant', async (req: Request, res: Response) => {
  const { action, text, record_id, field_name } = req.body;

  let recordContext = '';
  if (record_id) {
    const rec = db.getRecordById(record_id);
    if (rec) {
      recordContext = `Record Details: Title: "${rec.title}", Type: "${rec.ip_type}", Status: "${rec.application_status}", Reference: "${rec.application_number}", Abstract: "${rec.description}", Deadline: "${rec.next_deadline || 'None'}"`;
    }
  }

  const apiKey = process.env.FEATHERLESS_API_KEY;

  // If no key is configured, show structured administrative template
  if (!apiKey || apiKey === 'MY_FEATHERLESS_API_KEY') {
    return res.json({
      ai_mode: 'simulated_fallback',
      notice: 'Featherless API key is not configured. Displaying structured administrative template.',
      disclaimer: 'Administrative guidance only. Does not replace formal patent attorney consultation.',
      result: getFallbackAiResponse(action, text, recordContext, field_name)
    });
  }

  const systemInstruction = `You are the IP Guardian LegalTech Administrative Assistant for university innovation cells and researchers.
Your role is strictly non-legal administrative support:
- Summarize IP descriptions and office documents into clear bullet points.
- Extract candidate dates, applicant names, reference numbers, and administrative action items from text.
- Explain IP registry terminology in plain, accessible English.
- Draft non-legal administrative compliance checklists.
CRITICAL MANDATES:
- NEVER offer formal legal advice or legal opinions on patentability or non-infringement.
- NEVER invent fictitious statutory filing deadlines or claim legal guarantee.
- Always include an administrative disclaimer.`;

  let prompt = '';
  if (action === 'summarize') {
    prompt = `Provide a concise administrative summary (under 150 words) and key technical takeaways for this IP record or document excerpt:\n\n${text || recordContext}`;
  } else if (action === 'extract') {
    prompt = `Extract all potential administrative items from the following document or text excerpt into structured JSON format with: candidate_dates (array of {date, purpose}), names (array of inventors/owners), reference_numbers (array), and suggested_action_items (array of {action, urgency, source_passage}). Excerpt:\n\n${text || recordContext}`;
  } else if (action === 'checklist') {
    prompt = `Draft a non-legal administrative checklist of 4-6 preparation steps for an intellectual property asset in this review stage:\n\n${recordContext || text}`;
  } else if (action === 'explain_field') {
    prompt = `Explain the intellectual property concept or administrative field "${field_name || text}" in plain English for a university student inventor or researcher (under 80 words).`;
  } else {
    prompt = `Provide non-legal administrative IP workflow guidance for:\n\n${text || recordContext}`;
  }

  try {
    const featherlessRes = await fetch('https://api.featherless.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'Qwen/Qwen2.5-72B-Instruct',
        messages: [
          { role: 'system', content: systemInstruction },
          { role: 'user', content: prompt }
        ],
        temperature: 0.2
      })
    });

    if (!featherlessRes.ok) {
      throw new Error(`Featherless API error: ${featherlessRes.status} ${featherlessRes.statusText}`);
    }

    const data = await featherlessRes.json() as { choices: { message: { content: string } }[] };
    const resultText = data.choices?.[0]?.message?.content ?? '';

    res.json({
      ai_mode: 'live_featherless',
      model: 'Qwen/Qwen2.5-72B-Instruct',
      disclaimer: 'Administrative guidance generated by IP Guardian Assistant. Not a legal opinion or formal patent search.',
      result: resultText
    });
  } catch (err: any) {
    console.error('Featherless API error:', err.message);
    res.json({
      ai_mode: 'error_fallback',
      notice: `AI service returned: ${err.message}. Showing administrative template.`,
      disclaimer: 'Administrative guidance only.',
      result: getFallbackAiResponse(action, text, recordContext, field_name)
    });
  }
});

function getFallbackAiResponse(action: string, text?: string, recordContext?: string, field_name?: string): string {
  if (action === 'summarize') {
    return `### Administrative Executive Summary
- **Asset Scope:** Novel technical architecture documented in institutional repository.
- **Primary Objective:** Protect proprietary algorithms/composition while preserving academic publication rights.
- **Immediate Task:** Verify claims draft alignment against prior art disclosures.
- **Administrative Next Step:** Validate all co-inventors have executed institutional assignment agreements.`;
  }
  if (action === 'extract') {
    return `### Extracted Administrative Elements
- **Candidate Dates:** 30-day Office Action reply window identified; Annual review scheduled.
- **Key Entities:** Primary Inventors & Assignee Tech Transfer Office.
- **Reference Codes:** Formal docket identifier and classification codes verified.
- **Suggested Action Items:**
  1. File formal response brief with patent registry before statutory cutoff.
  2. Upload final claims appendix to local secure vault.
  3. Confirm co-inventor assignment signatures on institutional form.`;
  }
  if (action === 'checklist') {
    return `### Institutional Administrative Checklist
1. [ ] **Verify Inventor Affiliations:** Confirm all contributing researchers are listed on disclosure.
2. [ ] **Complete Assignment Deeds:** Ensure university IP ownership forms are signed by all inventors.
3. [ ] **Cross-Check Publication Embargos:** Verify no academic papers or conference talks precede formal filing date.
4. [ ] **Audit Office Action Deadlines:** Calendar the exact non-extendable response cutoff.
5. [ ] **Secure Vaulting:** Upload latest PDF claims draft and benchmark diagrams to IP Guardian.`;
  }
  return `### Field Explanation: ${field_name || 'IP Field'}
This administrative metadata field records official docket designations assigned by patent and trademark examiners. Keeping this verified prevents lost filings and ensures accurate legal status tracking during examination.`;
}
