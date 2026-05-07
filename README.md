# Regulatory and Licensing Platform

A full-stack web application for managing government licence applications. Built as a software engineering assessment MVP.

---

## Overview

The system supports two user roles:

- **Operator** — a business that submits licence applications, responds to officer feedback, and tracks application status
- **Officer** — a government licensing officer who reviews submissions, requests more information, records site visit findings, and approves or rejects applications

---

## Features Built

### Use Case 1 — Operator Application Submission & Resubmission

- Guided multi-section application form
- Document uploads (drag-and-drop)
- AI document verification status (mocked)
- Progress indicator per section
- Multi-round resubmission: only flagged sections are editable
- Revision history and previous officer comments visible per round

### Use Case 2 — Officer Application Review & Feedback

- Full submission view: all form data and documents
- Section-level and document-level feedback comments
- Predefined comment templates for common issues
- Status transitions with automatic operator notifications
- Comparison view: highlights changes between submission rounds
- Role-aware status labels (officer vs operator see different labels for the same state)

### Use Case 3 — On-Site Assessment (partial)

- Checklist data model and status transitions implemented
- Officer can mark checklist items as "Need Further Clarification"
- Operator sees only flagged items with officer comments
- Multi-round per-item clarification: stubbed (see SCOPE.md)

---

## Tech Stack

| Layer        | Technology                            |
| ------------ | ------------------------------------- |
| Backend      | Node.js, TypeScript, NestJS           |
| Database     | PostgreSQL, Prisma ORM                |
| Frontend     | React, TypeScript, Vite               |
| Auth         | JWT (RS256), role-based guards        |
| File Uploads | Multer (local disk, S3-ready adapter) |
| Testing      | Jest (unit), Supertest (integration)  |

---

## Project Structure

```
/
├── backend/                  # NestJS API
│   ├── src/
│   │   ├── auth/             # JWT auth, guards, role decorator
│   │   ├── applications/     # Application CRUD, status transitions
│   │   ├── feedback/         # Officer feedback and templates
│   │   ├── documents/        # Upload handling, AI verification stub
│   │   ├── checklist/        # UC3 site visit checklist
│   │   ├── notifications/    # Notification model
│   │   └── prisma/           # Prisma service and schema
│   └── test/                 # Integration tests
├── frontend/                 # React SPA
│   ├── src/
│   │   ├── pages/            # Operator and Officer page views
│   │   ├── components/       # Shared UI components
│   │   ├── hooks/            # API hooks
│   │   └── context/          # Auth context, role-aware routing
└── SCOPE.md
```

---

## Getting Started

### Prerequisites

- Node.js >= 18
- PostgreSQL >= 14
- npm >= 9
- docker desktop

### 0. Start Docker Container (PostgreSQL)

```bash
docker compose up -d
```

This starts the PostgreSQL database container. Verify it's running:

```bash
docker compose ps
```

### 1. unztip ECDA-Project

### 2. Set up

```bash
cp backend
npm install
```

```bash
npx prisma migrate dev
npx prisma db seed       # seeds roles, comment templates, demo users
```

### 4. Start the backend

```bash
cd backend
npm run start:dev        # runs on http://localhost:3000
```

### 5. Start the frontend

```bash
cd frontend
npm install
npm run dev              # runs on http://localhost:5173
```

---

## Demo Accounts (after seeding)

| Role     | Email                | Password    |
| -------- | -------------------- | ----------- |
| Officer  | officer@example.com  | password123 |
| Operator | operator@example.com | password123 |

---

## API Overview

| Method | Endpoint                      | Role     | Description                      |
| ------ | ----------------------------- | -------- | -------------------------------- |
| POST   | `/auth/login`                 | Public   | Login, returns JWT               |
| POST   | `/applications`               | Operator | Submit new application           |
| GET    | `/applications`               | Officer  | List all applications            |
| GET    | `/applications/:id`           | Both     | View application (role-filtered) |
| PATCH  | `/applications/:id/status`    | Officer  | Update status                    |
| POST   | `/applications/:id/feedback`  | Officer  | Add section feedback             |
| POST   | `/applications/:id/resubmit`  | Operator | Resubmit flagged sections        |
| POST   | `/applications/:id/documents` | Operator | Upload document                  |
| GET    | `/applications/:id/rounds`    | Both     | Submission round history         |
| GET    | `/applications/:id/checklist` | Officer  | View site checklist              |
| PATCH  | `/applications/:id/checklist` | Officer  | Save checklist draft / submit    |

---

## Key Engineering Decisions

**Status label mapping is enforced server-side.** The API response transformer maps internal status enums to role-appropriate labels before sending to the client. Operators never receive internal status strings.

**Submission snapshots.** Each resubmission creates an immutable `SubmissionRound` snapshot of the full application data. The comparison view diffs round N against round N-1 at the section level.

**Layered architecture.** Domain logic (status transition validation, operator visibility rules) lives in NestJS services and is unit-tested independently of HTTP. Controllers are thin.

**File storage is abstracted.** A `StorageAdapter` interface is injected into the document service. The local disk implementation is used in the MVP; swapping to S3 requires only a config change and a new adapter class.

---

## Known Gaps & Limitations

- File uploads are stored on local disk — not suitable for multi-instance deployment without shared storage
- AI document verification returns a hardcoded mock response
- Notifications are stored in the DB but not delivered via email
- UC3 multi-round per-item clarification is stubbed (single round only)
- No pagination on the officer application list
- No WebSocket/SSE for real-time status updates — clients must poll

---

## AI Usage

### Tools Used

- **GitHub Copilot** — inline code completion throughout backend and frontend development
- **Claude (Anthropic)** — architecture discussions, generating boilerplate, reviewing state machine logic

### How AI Was Used

| Task                     | Tool    | How I Used It                                                                                       |
| ------------------------ | ------- | --------------------------------------------------------------------------------------------------- |
| Prisma schema design     | Claude  | Provided the status enum and relationship requirements; reviewed and corrected the generated schema |
| NestJS guard boilerplate | Copilot | Accepted generated JWT guard; added missing role extraction logic manually                          |
| Status label mapping     | Claude  | Prompted with full status table from requirements; validated output against the spec row by row     |
| React form components    | Copilot | Used for form field scaffolding; rewrote validation logic which was too permissive                  |
| Test cases               | Claude  | Generated happy-path tests; wrote edge-case and failure tests manually                              |

### Where AI Was Unhelpful

- The multi-round resubmission diff logic required understanding of the full data model — AI suggestions were generic and needed significant rework
- AI-generated error messages were too verbose; replaced with concise, user-facing copy

### How I Validated AI Output

- All AI-generated code was read line-by-line before committing
- Schema changes were tested against the requirements' status mapping table manually
- Any AI output touching security (auth guards, role checks) was verified against the NestJS docs and tested with integration tests

---

## What I Would Do Next

1. **UC3 multi-round post-site clarification** — per-item conversation thread with audit trail
2. **Real file storage** — S3 with pre-signed URLs for secure document access
3. **Real AI verification** — wire up a document verification service (AWS Textract or similar)
4. **Email notifications** — connect the notification model to SendGrid/SES
5. **Officer assignment** — assign officers to applications for workload management
6. **Server-side pagination** — required for production-scale application lists
7. **Playwright E2E tests** — covering the full submission → feedback → resubmission cycle
8. **Audit log UI** — surface the complete history of status changes and feedback to both roles
