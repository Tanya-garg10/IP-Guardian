# IP Guardian — Innovation Command Center

*Tagline: Protect Ideas. Track Innovation. Never Miss a Deadline.*

## 1. Product Overview & Creative Direction

**IP Guardian — Innovation Command Center** is a purpose-built LegalTech SaaS platform that unifies patent, trademark, and copyright management for university innovation cells, research laboratories, and student creators.

### Distinctive Visual Identity
- **Canvas Base:** Warm Ivory (`#F8F7F3`)
- **Typography & Structure:** Deep Midnight Navy (`#1E2A49`)
- **Primary Accent:** Electric Cobalt (`#4563EB`)
- **Success & Granted:** Fresh Mint (`#DDF5E9`, `#12633C`)
- **Entity & AI Highlights:** Soft Lavender (`#EFE8FF`, `#55349E`)
- **Restrained Warnings:** Muted Coral (`#F9E2E7`, `#9C243E`)
- **Geometry:** 14–18px rounded borders (`rounded-2xl`, `rounded-xl`), single-elevation cards with subtle borders (`#E7E3D8`), and intentional asymmetry.

## 2. Core Functional Modules

### 1. Innovation Command Center (Dashboard)
- **Top Command Bar:** Dynamic workspace switcher (Apex University, St. Jude Tech Transfer, BioNexus Incubator), notification popover for urgent statutory tasks, universal `Cmd+K` command search, and role switcher.
- **Data-Driven Metrics:** Real-time asset counts, category breakdowns, and due-soon countdowns calculated from verified database records.
- **Two-Column Layout:** Application pipeline distribution bar charts, category donut charts, visual deadline timeline, and urgent tasks requiring attention.
- **Portfolio Health Meter:** Live average completeness score with one-click access to audit items.

### 2. IP Portfolio (Visual Cards & Structured Table)
- **Interactive Switcher:** Seamlessly toggle between visual card grid view and structured registry table view.
- **Category Distinctions:** Cobalt for Patents, Mint for Trademarks, Lavender for Copyrights.
- **Instant Search & Filter Presets:** "Needs Immediate Attention", "Patents in Review", "Approved Assets".
- **Bulk Selection & Export:** Select multiple records and stream instant CSV exports.

### 3. Record Dossier & Innovation Timeline (Slide-Over Drawer)
- **Lifecycle Progression:** `Idea → Draft → Filed → Under Review → Approved / Rejected`.
- **Activity History:** Full chronological audit log tracking stage transitions, file attachments, and notes with timestamps and user roles.
- **Supporting Documents:** Manage and stream vaulted files directly inside the drawer.
- **Completeness Breakdown:** Interactive checklist with click-to-fix shortcuts.

### 4. Deadline Command Center
- **Task Grouping:** Overdue, Due Soon (≤ 7 Days), Upcoming, and Completed tasks.
- **Task Resolution:** Checkbox toggle to mark administrative tasks as completed or reopen them.
- **Configurable System Date:** Reference date switcher for forward deadline projection.
- **Accessible Warnings:** Non-alarming muted coral warnings paired with clear days-remaining counts.

### 5. IP Health & Completeness Audit
- **Explainable Administrative Score (0–100%):**
  - Descriptive Title (15%)
  - Technical Abstract / Scope (15%)
  - Inventor Attribution (15%)
  - Assignee Organization (15%)
  - Application Reference Number (15%)
  - Deadline Scheduled or Confirmed (10%)
  - Supporting Documents Vaulted (15%)
- **Click-to-Fix:** Click any missing item to immediately open the edit form or file uploader.

### 6. Smart Document Vault
- **Encrypted Local Storage:** Files isolated in `./data/uploads/` with cryptographic hashes.
- **Upload Progress Simulation:** Real-time feedback and validation for PDF, Word, text, and image files (up to 10MB).
- **Secure File Previews:** Safe inspection modal displaying MIME headers, file sizes, and context before downloading.

### 7. AI IP Assistant (Powered by Gemini 3.8 Flash)
- **Capabilities:**
  - Executive summarization of invention disclosures.
  - Entity extraction: Candidate dates, applicant names, reference codes, and action items.
  - Plain-English explanation of patent and trademark examination terms.
  - Non-legal administrative checklist drafting.
- **Architecture:** Server-side proxy via `@google/genai` with model `gemini-3.8-flash`. Includes automated administrative fallback templates if an external API key is restricted.

### 8. Role-Aware Collaboration
- **Inventor:** Submit new invention disclosures, view owned assets, check personal deadlines.
- **Coordinator:** Full portfolio oversight, task allocation, file vaulting, and status updates.
- **Reviewer:** Prior art audits, review notes, and examination checks.
- **Administrator:** System-wide governance, data purge, and institutional export.

### 9. Social Impact & Reporting
- **Empirical Metrics:** IP records organized, average completeness, tasks identified vs completed, vaulted files.
- **Institutional Reports:** Real CSV export generation and print-ready summary tables.

## 3. Technology Stack

- **Frontend:** React 19, TypeScript, Tailwind CSS v4, Recharts, Lucide React, Motion.
- **Backend:** Node.js, Express 4.x, Multer, `@google/genai` TypeScript SDK.
- **Persistence:** Atomic JSON file persistence (`./data/ip_guardian_db.json`) with safe atomic write swapping and zero native compilation dependencies.
- **Target Architecture:** Complete Django 5.x and PostgreSQL models & serializers included in `backend_django_reference/`.

## 4. Quickstart Instructions

```bash
# Install dependencies
npm install

# Start full-stack development server
npm run dev

# Access the Command Center
http://localhost:3000
```

## 5. Mandatory Legal Disclaimer

> **Administrative Notice:** IP Guardian supports administrative tracking and does not replace professional legal advice or official deadline verification. Official filing dates, fee grace periods, and patent or trademark office actions must be audited against authorized national and international intellectual property registries (such as USPTO, EPO, or WIPO).
