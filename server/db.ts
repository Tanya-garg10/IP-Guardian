import fs from 'fs';
import path from 'path';
import {
  DatabaseSchema,
  IPRecord,
  DocumentRecord,
  ActivityRecord,
  DeadlineItem,
  AnalyticsSummary,
  DeadlineUrgency,
  CompletenessBreakdown
} from './types.js';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'ip_guardian_db.json');
export const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

export const INITIAL_DEMO_RECORDS: IPRecord[] = [
  {
    id: 'rec-001',
    title: 'Neural Signal Compression Algorithm for Brain-Computer Interfaces',
    ip_type: 'Patent',
    description: 'A low-latency wavelet transformation compression architecture engineered specifically for wireless implantable BCI electrodes operating within micro-watt power bounds.',
    inventor_name: 'Dr. Elena Rostova & Marcus Vance',
    owner_name: 'Apex University Tech Transfer Office',
    application_number: 'US-2026-094182-A1',
    filing_date: '2026-04-12',
    application_status: 'Under Review',
    next_deadline: '2026-10-18', // Due in 7 days relative to Oct 11, 2026
    deadline_completed: false,
    notes: 'USPTO Non-Final Office Action response due. Prior art rejection on Claim 4 addressed by legal counsel on Oct 3.',
    created_at: '2026-04-12T14:30:00.000Z',
    updated_at: '2026-10-04T09:15:00.000Z',
    created_by: 'director@university-techtransfer.org'
  },
  {
    id: 'rec-002',
    title: 'AuraClean Biomaterials Brand & Device Mark',
    ip_type: 'Trademark',
    description: 'Word mark and geometric logomark covering Class 001 (Chemicals for industrial science) and Class 005 (Sanitary medical polymers).',
    inventor_name: 'Priya Sharma (Founding Lead)',
    owner_name: 'BioNexus Green Ventures Ltd.',
    application_number: 'TM-2026-788210',
    filing_date: '2026-07-05',
    application_status: 'Filed',
    next_deadline: '2026-10-04', // Overdue by 7 days relative to Oct 11, 2026
    deadline_completed: false,
    notes: 'Statement of Use & specimen submission overdue. Requires immediate extension request filing with national trademark registry.',
    created_at: '2026-07-05T11:20:00.000Z',
    updated_at: '2026-10-05T16:45:00.000Z',
    created_by: 'student.inventor@bionexus.edu'
  },
  {
    id: 'rec-003',
    title: 'OpenAudit AI — Fair Algorithmic Assessment Library',
    ip_type: 'Copyright',
    description: 'Comprehensive source code repository, documentation manuals, and statistical benchmark datasets for automated bias audits in civic AI tools.',
    inventor_name: 'Liam Chen & Maya O\'Connor',
    owner_name: 'Student Open Innovation Collective',
    application_number: 'CR-2026-11048',
    filing_date: '2026-02-14',
    application_status: 'Approved',
    next_deadline: '2026-12-01', // Upcoming
    deadline_completed: false,
    notes: 'Registered with US Copyright Office. Certificate TXu 2-481-990 issued. Annual open source compliance review scheduled for December.',
    created_at: '2026-02-14T08:00:00.000Z',
    updated_at: '2026-06-20T12:00:00.000Z',
    created_by: 'liam.chen@student-lab.edu'
  },
  {
    id: 'rec-004',
    title: 'Microfluidic Point-of-Care Biosensor for Rapid Sepsis Detection',
    ip_type: 'Patent',
    description: 'Capillary-driven multiplex microfluidic cassette capable of quantifying interleukin-6 and procalcitonin from 10 microliters of capillary whole blood in under 8 minutes.',
    inventor_name: 'Dr. K. Ananth & Sarah Lin',
    owner_name: 'Apex University Tech Transfer Office',
    application_number: 'PCT/US2026/029811',
    filing_date: '2026-09-20',
    application_status: 'Draft',
    next_deadline: '2026-10-25', // Upcoming in 14 days
    deadline_completed: false,
    notes: 'Final claims review with patent attorney scheduled for Oct 16. Working on supplementary clinical trial data charts.',
    created_at: '2026-09-20T10:10:00.000Z',
    updated_at: '2026-10-08T18:20:00.000Z',
    created_by: 'director@university-techtransfer.org'
  },
  {
    id: 'rec-005',
    title: 'Solid-State Electrolyte Composite for Fast-Charge Sodium Batteries',
    ip_type: 'Patent',
    description: 'Solvent-free ceramic-polymer hybrid electrolyte membrane demonstrating ionic conductivity exceeding 2.4 mS/cm at ambient 25°C.',
    inventor_name: 'David Takahashi & Dr. Fatima Zahra',
    owner_name: 'CleanTech Labs Foundation',
    application_number: 'PCT/IB2026/041990',
    filing_date: '2026-05-18',
    application_status: 'Filed',
    next_deadline: '2026-11-15', // Upcoming in ~35 days
    deadline_completed: false,
    notes: 'International Search Report received with all 12 novel claims recognized. National phase entry deadline strategy pending.',
    created_at: '2026-05-18T16:00:00.000Z',
    updated_at: '2026-08-30T14:10:00.000Z',
    created_by: 'dtakahashi@cleantechlabs.org'
  },
  {
    id: 'rec-006',
    title: 'NeuroSim Interactive Cognitive Curriculum & Digital Courseware',
    ip_type: 'Copyright',
    description: 'Interactive pedagogical software modules, audiovisual 3D neuro-anatomy simulations, and structured clinical evaluation rubrics.',
    inventor_name: 'Prof. Arthur Pendleton',
    owner_name: 'Apex University Tech Transfer Office',
    application_number: 'CR-2026-09941',
    filing_date: '2026-08-01',
    application_status: 'Under Review',
    next_deadline: '2026-09-30', // Overdue by 11 days
    deadline_completed: false,
    notes: 'Deposit copy supplement requested by copyright examiner on Sept 15. Need to upload finalized source code zip file.',
    created_at: '2026-08-01T09:30:00.000Z',
    updated_at: '2026-09-28T11:45:00.000Z',
    created_by: 'director@university-techtransfer.org'
  },
  {
    id: 'rec-007',
    title: 'VerdantFlow Renewable Hydro-Turbine Control Firmware',
    ip_type: 'Trademark',
    description: 'Commercial service mark for distributed hydro-kinetic micro-generation power systems and associated telemetry software.',
    inventor_name: 'Camila Fernandez',
    owner_name: 'Verdant Power Systems',
    application_number: 'TM-2025-554190',
    filing_date: '2025-11-10',
    application_status: 'Approved',
    next_deadline: null,
    deadline_completed: true,
    notes: 'Registration granted. 5-year declaration of continuous use will fall due in November 2030.',
    created_at: '2025-11-10T13:00:00.000Z',
    updated_at: '2026-04-15T15:20:00.000Z',
    created_by: 'legal@verdantpower.com'
  }
];

export const INITIAL_DEMO_DOCUMENTS: DocumentRecord[] = [
  {
    id: 'doc-001',
    ip_record: 'rec-001',
    filename: 'USPTO_NonFinal_OfficeAction_Response_Draft.pdf',
    stored_filename: 'sample_rec001_office_action.pdf',
    file_type: 'application/pdf',
    file_size: 482100,
    upload_date: '2026-10-03T16:15:00.000Z',
    storage_reference: 'sample_rec001_office_action.pdf',
    description: 'Formal legal brief replying to examiner prior art references on claims 4-7.'
  },
  {
    id: 'doc-002',
    ip_record: 'rec-001',
    filename: 'BCI_Compression_Algorithm_Benchmark_Report.pdf',
    stored_filename: 'sample_rec001_benchmark.pdf',
    file_type: 'application/pdf',
    file_size: 1240500,
    upload_date: '2026-04-12T14:40:00.000Z',
    storage_reference: 'sample_rec001_benchmark.pdf',
    description: 'Empirical verification data comparing compression latency on FPGA hardware.'
  },
  {
    id: 'doc-003',
    ip_record: 'rec-002',
    filename: 'AuraClean_Specimen_Packaging_Photo.png',
    stored_filename: 'sample_rec002_specimen.png',
    file_type: 'image/png',
    file_size: 384000,
    upload_date: '2026-07-05T11:35:00.000Z',
    storage_reference: 'sample_rec002_specimen.png',
    description: 'Photographic specimen showing mark as used in commerce on secondary sterile packaging.'
  },
  {
    id: 'doc-004',
    ip_record: 'rec-003',
    filename: 'OpenAudit_TXu_Copyright_Registration_Certificate.pdf',
    stored_filename: 'sample_rec003_cert.pdf',
    file_type: 'application/pdf',
    file_size: 312000,
    upload_date: '2026-06-20T12:10:00.000Z',
    storage_reference: 'sample_rec003_cert.pdf',
    description: 'Official registration seal and certificate from the US Copyright Office.'
  }
];

export const INITIAL_DEMO_ACTIVITIES: ActivityRecord[] = [
  {
    id: 'act-001',
    record_id: 'rec-001',
    action: 'Document Vaulted',
    description: 'Uploaded draft response brief addressing USPTO office action on claims 4-7.',
    timestamp: '2026-10-03T16:15:00.000Z',
    user: 'Dr. Sarah Lin',
    user_role: 'Coordinator'
  },
  {
    id: 'act-002',
    record_id: 'rec-001',
    action: 'Status Changed',
    description: 'Application advanced from Filed to Under Review following receipt of official office action.',
    timestamp: '2026-08-15T11:00:00.000Z',
    user: 'Marcus Vance',
    user_role: 'Reviewer'
  },
  {
    id: 'act-003',
    record_id: 'rec-001',
    action: 'Record Created',
    description: 'Initial university research disclosure registered in institutional portfolio.',
    timestamp: '2026-04-12T14:30:00.000Z',
    user: 'Dr. Elena Rostova',
    user_role: 'Inventor'
  },
  {
    id: 'act-004',
    record_id: 'rec-002',
    action: 'Deadline Alert',
    description: 'Trademark Statement of Use cutoff elapsed. Extension request needed.',
    timestamp: '2026-10-05T16:45:00.000Z',
    user: 'System Monitor',
    user_role: 'Coordinator'
  },
  {
    id: 'act-005',
    record_id: 'rec-002',
    action: 'Document Vaulted',
    description: 'Uploaded photographic specimen showing trademark on sterile packaging.',
    timestamp: '2026-07-05T11:35:00.000Z',
    user: 'Priya Sharma',
    user_role: 'Inventor'
  },
  {
    id: 'act-006',
    record_id: 'rec-003',
    action: 'Status Changed',
    description: 'Copyright Office certificate TXu 2-481-990 validated. Marked as Approved.',
    timestamp: '2026-06-20T12:15:00.000Z',
    user: 'Dr. Sarah Lin',
    user_role: 'Administrator'
  },
  {
    id: 'act-007',
    record_id: 'rec-004',
    action: 'Record Created',
    description: 'Early-stage invention disclosure logged for microfluidic point-of-care sepsis cassette.',
    timestamp: '2026-09-20T10:10:00.000Z',
    user: 'Dr. K. Ananth',
    user_role: 'Inventor'
  }
];

function seedSampleFiles() {
  for (const doc of INITIAL_DEMO_DOCUMENTS) {
    const filePath = path.join(UPLOADS_DIR, doc.stored_filename);
    if (!fs.existsSync(filePath)) {
      const sampleText = `--- IP GUARDIAN COMMAND CENTER SECURE VAULT ---\nFilename: ${doc.filename}\nRecord ID: ${doc.ip_record}\nUpload Timestamp: ${doc.upload_date}\nFormat: ${doc.file_type}\nDescription: ${doc.description || 'Administrative supporting file'}\n\nNotice: This document is an authenticated supporting record stored in the local development repository. In production, this file is protected by storage ACLs and encrypted at rest.\n`;
      fs.writeFileSync(filePath, sampleText, 'utf-8');
    }
  }
}

class DatabaseManager {
  private cache: DatabaseSchema | null = null;

  private readDb(): DatabaseSchema {
    if (this.cache) return this.cache;

    if (!fs.existsSync(DB_FILE)) {
      const initialData: DatabaseSchema = {
        records: INITIAL_DEMO_RECORDS,
        documents: INITIAL_DEMO_DOCUMENTS,
        activities: INITIAL_DEMO_ACTIVITIES,
        meta: {
          last_updated: new Date().toISOString(),
          version: '2.0.0'
        }
      };
      this.writeDb(initialData);
      seedSampleFiles();
      return initialData;
    }

    try {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      this.cache = JSON.parse(raw);
      if (!this.cache!.activities) {
        this.cache!.activities = INITIAL_DEMO_ACTIVITIES;
      }
      return this.cache!;
    } catch (err) {
      console.error('Failed reading database file, re-initializing with demo data:', err);
      const fallbackData: DatabaseSchema = {
        records: INITIAL_DEMO_RECORDS,
        documents: INITIAL_DEMO_DOCUMENTS,
        activities: INITIAL_DEMO_ACTIVITIES,
        meta: {
          last_updated: new Date().toISOString(),
          version: '2.0.0'
        }
      };
      this.writeDb(fallbackData);
      return fallbackData;
    }
  }

  private writeDb(data: DatabaseSchema) {
    data.meta.last_updated = new Date().toISOString();
    this.cache = data;
    const tempFile = `${DB_FILE}.tmp.${Date.now()}`;
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tempFile, DB_FILE);
  }

  public getAllRecords(): IPRecord[] {
    const db = this.readDb();
    return [...db.records];
  }

  public getRecordById(id: string): IPRecord | null {
    const db = this.readDb();
    return db.records.find(r => r.id === id) || null;
  }

  public createRecord(
    recordData: Omit<IPRecord, 'id' | 'created_at' | 'updated_at'>,
    authorName = 'Dr. Sarah Lin',
    authorRole: ActivityRecord['user_role'] = 'Coordinator'
  ): IPRecord {
    const db = this.readDb();
    const now = new Date().toISOString();
    const newRecord: IPRecord = {
      ...recordData,
      id: `rec-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      deadline_completed: false,
      created_at: now,
      updated_at: now
    };

    db.records.unshift(newRecord);

    // Add activity log
    db.activities.unshift({
      id: `act-${Date.now().toString(36)}`,
      record_id: newRecord.id,
      action: 'Record Created',
      description: `New ${newRecord.ip_type} "${newRecord.title}" recorded with status "${newRecord.application_status}".`,
      timestamp: now,
      user: authorName,
      user_role: authorRole
    });

    this.writeDb(db);
    return newRecord;
  }

  public updateRecord(
    id: string,
    updates: Partial<Omit<IPRecord, 'id' | 'created_at'>>,
    authorName = 'Dr. Sarah Lin',
    authorRole: ActivityRecord['user_role'] = 'Coordinator'
  ): IPRecord | null {
    const db = this.readDb();
    const index = db.records.findIndex(r => r.id === id);
    if (index === -1) return null;

    const existing = db.records[index];
    const now = new Date().toISOString();
    const updated: IPRecord = {
      ...existing,
      ...updates,
      updated_at: now
    };

    db.records[index] = updated;

    // Log significant changes
    let changeDesc = 'Updated record metadata and administrative notes.';
    if (updates.application_status && updates.application_status !== existing.application_status) {
      changeDesc = `Status transitioned from "${existing.application_status}" to "${updates.application_status}".`;
    } else if (updates.next_deadline && updates.next_deadline !== existing.next_deadline) {
      changeDesc = `Next administrative deadline rescheduled to ${updates.next_deadline}.`;
    }

    db.activities.unshift({
      id: `act-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 5)}`,
      record_id: id,
      action: updates.application_status ? 'Status Changed' : 'Record Updated',
      description: changeDesc,
      timestamp: now,
      user: authorName,
      user_role: authorRole
    });

    this.writeDb(db);
    return updated;
  }

  public toggleDeadlineCompletion(id: string): { record: IPRecord | null; completed: boolean } {
    const db = this.readDb();
    const index = db.records.findIndex(r => r.id === id);
    if (index === -1) return { record: null, completed: false };

    const record = db.records[index];
    const newState = !record.deadline_completed;
    record.deadline_completed = newState;
    record.updated_at = new Date().toISOString();

    db.activities.unshift({
      id: `act-${Date.now().toString(36)}`,
      record_id: id,
      action: newState ? 'Task Completed' : 'Task Reopened',
      description: newState
        ? `Administrative task marked as completed by team.`
        : `Administrative task reopened for follow-up.`,
      timestamp: new Date().toISOString(),
      user: 'Dr. Sarah Lin',
      user_role: 'Coordinator'
    });

    this.writeDb(db);
    return { record, completed: newState };
  }

  public deleteRecord(id: string): boolean {
    const db = this.readDb();
    const initialLen = db.records.length;
    db.records = db.records.filter(r => r.id !== id);
    if (db.records.length === initialLen) return false;

    // Clean up documents & files
    const associatedDocs = db.documents.filter(d => d.ip_record === id);
    for (const doc of associatedDocs) {
      const filePath = path.join(UPLOADS_DIR, doc.stored_filename);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch {
          // ignore
        }
      }
    }
    db.documents = db.documents.filter(d => d.ip_record !== id);
    db.activities = db.activities.filter(a => a.record_id !== id);

    this.writeDb(db);
    return true;
  }

  public getAllDocuments(): DocumentRecord[] {
    const db = this.readDb();
    return [...db.documents];
  }

  public getDocumentsForRecord(recordId: string): DocumentRecord[] {
    const db = this.readDb();
    return db.documents.filter(d => d.ip_record === recordId);
  }

  public getDocumentById(id: string): DocumentRecord | null {
    const db = this.readDb();
    return db.documents.find(d => d.id === id) || null;
  }

  public addDocument(
    docData: Omit<DocumentRecord, 'id' | 'upload_date'>,
    authorName = 'Dr. Sarah Lin',
    authorRole: ActivityRecord['user_role'] = 'Coordinator'
  ): DocumentRecord {
    const db = this.readDb();
    const now = new Date().toISOString();
    const newDoc: DocumentRecord = {
      ...docData,
      id: `doc-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      upload_date: now
    };
    db.documents.unshift(newDoc);

    // Activity log
    db.activities.unshift({
      id: `act-${Date.now().toString(36)}`,
      record_id: docData.ip_record,
      action: 'Document Vaulted',
      description: `Uploaded "${newDoc.filename}" (${(newDoc.file_size / 1024).toFixed(1)} KB) to secure storage.`,
      timestamp: now,
      user: authorName,
      user_role: authorRole
    });

    this.writeDb(db);
    return newDoc;
  }

  public deleteDocument(id: string): boolean {
    const db = this.readDb();
    const doc = db.documents.find(d => d.id === id);
    if (!doc) return false;

    db.documents = db.documents.filter(d => d.id !== id);
    const filePath = path.join(UPLOADS_DIR, doc.stored_filename);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch {
        // ignore
      }
    }

    db.activities.unshift({
      id: `act-${Date.now().toString(36)}`,
      record_id: doc.ip_record,
      action: 'Document Removed',
      description: `Removed "${doc.filename}" from vault storage.`,
      timestamp: new Date().toISOString(),
      user: 'Dr. Sarah Lin',
      user_role: 'Coordinator'
    });

    this.writeDb(db);
    return true;
  }

  public getActivitiesForRecord(recordId: string): ActivityRecord[] {
    const db = this.readDb();
    return db.activities.filter(a => a.record_id === recordId);
  }

  public getAllActivities(): ActivityRecord[] {
    const db = this.readDb();
    return [...db.activities];
  }

  public resetDemoData(): void {
    const fresh: DatabaseSchema = {
      records: JSON.parse(JSON.stringify(INITIAL_DEMO_RECORDS)),
      documents: JSON.parse(JSON.stringify(INITIAL_DEMO_DOCUMENTS)),
      activities: JSON.parse(JSON.stringify(INITIAL_DEMO_ACTIVITIES)),
      meta: {
        last_updated: new Date().toISOString(),
        version: '2.0.0'
      }
    };
    this.writeDb(fresh);
    seedSampleFiles();
  }

  // Calculate explainable administrative completeness score (0-100)
  public calculateRecordCompleteness(record: IPRecord): CompletenessBreakdown {
    const db = this.readDb();
    const docs = db.documents.filter(d => d.ip_record === record.id);

    const title_valid = Boolean(record.title && record.title.trim().length >= 8);
    const description_valid = Boolean(record.description && record.description.trim().length >= 25);
    const inventor_valid = Boolean(record.inventor_name && record.inventor_name.trim().length >= 3);
    const owner_valid = Boolean(record.owner_name && record.owner_name.trim().length >= 3);
    const app_number_valid = Boolean(record.application_number && record.application_number.trim().length >= 4);
    const deadline_set = Boolean(record.next_deadline || record.application_status === 'Approved');
    const document_attached = docs.length > 0;

    let score = 0;
    const missing_items: { field: string; message: string; action_target: string }[] = [];
    const passed_items: string[] = [];

    if (title_valid) {
      score += 15;
      passed_items.push('Descriptive Invention Title');
    } else {
      missing_items.push({
        field: 'title',
        message: 'Title is brief or missing (< 8 characters)',
        action_target: 'edit'
      });
    }

    if (description_valid) {
      score += 15;
      passed_items.push('Technical Abstract / Scope Definition');
    } else {
      missing_items.push({
        field: 'description',
        message: 'Provide a comprehensive technical abstract or scope description',
        action_target: 'edit'
      });
    }

    if (inventor_valid) {
      score += 15;
      passed_items.push('Verified Inventor(s) Attributed');
    } else {
      missing_items.push({
        field: 'inventor_name',
        message: 'Specify inventor or creator name(s)',
        action_target: 'edit'
      });
    }

    if (owner_valid) {
      score += 15;
      passed_items.push('Owner / Assignee Organization Recorded');
    } else {
      missing_items.push({
        field: 'owner_name',
        message: 'Specify owner institution or startup entity',
        action_target: 'edit'
      });
    }

    if (app_number_valid) {
      score += 15;
      passed_items.push('Formal Reference / Application Number Assigned');
    } else {
      missing_items.push({
        field: 'application_number',
        message: 'Assign formal application or internal docket number',
        action_target: 'edit'
      });
    }

    if (deadline_set) {
      score += 10;
      passed_items.push(record.next_deadline ? 'Next Administrative Deadline Scheduled' : 'Status Approved (No Immediate Cutoff)');
    } else {
      missing_items.push({
        field: 'next_deadline',
        message: 'Schedule next statutory office action cutoff or renewal date',
        action_target: 'deadline'
      });
    }

    if (document_attached) {
      score += 15;
      passed_items.push(`Supporting Files Vaulted (${docs.length} ${docs.length === 1 ? 'file' : 'files'})`);
    } else {
      missing_items.push({
        field: 'documents',
        message: 'Attach supporting documents (claims brief, office action, specimen)',
        action_target: 'upload'
      });
    }

    return {
      score,
      title_valid,
      description_valid,
      inventor_valid,
      owner_valid,
      app_number_valid,
      deadline_set,
      document_attached,
      missing_items,
      passed_items
    };
  }

  // Calculate deadline items relative to current reference date (2026-10-11)
  public getDeadlineItems(referenceDateStr?: string): DeadlineItem[] {
    const db = this.readDb();
    const today = referenceDateStr ? new Date(referenceDateStr) : new Date('2026-10-11T00:00:00.000Z');
    today.setHours(0, 0, 0, 0);

    return db.records.map(record => {
      const isCompleted = Boolean(record.deadline_completed);

      if (!record.next_deadline) {
        return {
          record_id: record.id,
          title: record.title,
          ip_type: record.ip_type,
          application_number: record.application_number,
          application_status: record.application_status,
          owner_name: record.owner_name,
          inventor_name: record.inventor_name,
          deadline_date: null,
          days_remaining: null,
          urgency: 'none' as DeadlineUrgency,
          deadline_completed: isCompleted,
          notes: record.notes
        };
      }

      const target = new Date(`${record.next_deadline}T00:00:00.000Z`);
      target.setHours(0, 0, 0, 0);
      const diffMs = target.getTime() - today.getTime();
      const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

      let urgency: DeadlineUrgency = 'upcoming';
      if (diffDays < 0) {
        urgency = 'overdue';
      } else if (diffDays <= 7) {
        urgency = 'due_soon';
      } else {
        urgency = 'upcoming';
      }

      return {
        record_id: record.id,
        title: record.title,
        ip_type: record.ip_type,
        application_number: record.application_number,
        application_status: record.application_status,
        owner_name: record.owner_name,
        inventor_name: record.inventor_name,
        deadline_date: record.next_deadline,
        days_remaining: diffDays,
        urgency,
        deadline_completed: isCompleted,
        notes: record.notes
      };
    });
  }

  public getAnalyticsSummary(): AnalyticsSummary {
    const records = this.getAllRecords();
    const documents = this.getAllDocuments();
    const deadlines = this.getDeadlineItems();

    const by_type = {
      patents: records.filter(r => r.ip_type === 'Patent').length,
      trademarks: records.filter(r => r.ip_type === 'Trademark').length,
      copyrights: records.filter(r => r.ip_type === 'Copyright').length,
    };

    const by_status = {
      idea: records.filter(r => r.application_status === 'Idea').length,
      draft: records.filter(r => r.application_status === 'Draft').length,
      filed: records.filter(r => r.application_status === 'Filed').length,
      under_review: records.filter(r => r.application_status === 'Under Review').length,
      approved: records.filter(r => r.application_status === 'Approved').length,
      rejected: records.filter(r => r.application_status === 'Rejected').length,
    };

    const activeDeadlines = deadlines.filter(d => !d.deadline_completed);
    const deadlineCounts = {
      overdue: activeDeadlines.filter(d => d.urgency === 'overdue').length,
      due_soon: activeDeadlines.filter(d => d.urgency === 'due_soon').length,
      upcoming: activeDeadlines.filter(d => d.urgency === 'upcoming').length,
      completed: deadlines.filter(d => d.deadline_completed).length,
      none: activeDeadlines.filter(d => d.urgency === 'none').length,
    };

    // Calculate portfolio average completeness
    let totalScore = 0;
    records.forEach(r => {
      totalScore += this.calculateRecordCompleteness(r).score;
    });
    const overall_completeness = records.length > 0 ? Math.round(totalScore / records.length) : 100;

    const sorted = [...records].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return {
      total_records: records.length,
      by_type,
      by_status,
      deadlines: deadlineCounts,
      recent_records: sorted.slice(0, 5),
      total_documents: documents.length,
      overall_completeness
    };
  }
}

export const db = new DatabaseManager();
