# SCOPE.md — Regulatory and Licensing Platform

## What I Am Building

I chose to implement **Use Case 1 (Operator Application Submission & Resubmission)** and **Use Case 2 (Officer Application Review & Feedback)** as the core MVP. These two use cases together cover the full application lifecycle state machine, role-based access control, feedback loops, and multi-round resubmission — which demonstrates the most critical engineering decisions in this system.

Use Case 3 (On-Site Assessment) is partially implemented: the checklist data model and status transitions are in place, but the multi-round post-site clarification workflow is stubbed.

---

## Use Cases — Build vs Defer

| Use Case                                  | Decision     | Reason                                                                                                |
| ----------------------------------------- | ------------ | ----------------------------------------------------------------------------------------------------- |
| UC1 — Operator Submission & Resubmission  | **Built**    | Core operator workflow; demonstrates form handling, file upload, and multi-round resubmission         |
| UC2 — Officer Review & Feedback           | **Built**    | Core officer workflow; demonstrates role-gated views, feedback, status transitions, and notifications |
| UC3 — On-Site Assessment (single round)   | **Partial**  | Checklist model and status transitions built; multi-round clarification per item is stubbed           |
| UC3 — Multi-round Post-Site Clarification | **Deferred** | Adds complexity without changing the core architecture; noted as "What I would do next"               |

---

## What Is Mocked or Stubbed

| Feature                  | Approach                                                       | Reason                                                                  |
| ------------------------ | -------------------------------------------------------------- | ----------------------------------------------------------------------- |
| AI document verification | Returns a hardcoded `{ status: "verified", confidence: 0.95 }` | No AI service provided; shape of integration is clear                   |
| File storage             | Files saved to local `/uploads` directory                      | Simulates S3/blob storage; would swap to a real provider in production  |
| Email notifications      | Stored as rows in a `notifications` table with `sent: false`   | Demonstrates the notification model without requiring an SMTP/SES setup |
| Real-time status updates | REST polling; no WebSocket                                     | Avoids infrastructure complexity for the assessment                     |

---

## Assumptions

1. **Authentication is session-based JWT** — no SSO or OAuth provider is specified, so I implemented username/password login with JWT and role claims (`operator` / `officer`).
2. **One operator per application** — an operator creates and owns their application; no shared/joint applications.
3. **Officers can view all applications** — no assignment workflow (officer-to-application matching) is specified, so all officers see all applications.
4. **"Specific form section" feedback** — I modelled sections as named keys (e.g. `business_details`, `documents`). The exact section taxonomy is not specified, so I used a reasonable set.
5. **Operator label mapping** is enforced server-side — the API never returns the internal status string to an operator; it always returns the mapped label.
6. **Predefined comment templates** — seeded as static data in the DB; officers can select or write free text.
7. **Unlimited resubmission rounds** — each resubmission creates a new `SubmissionRound` snapshot; no cap enforced.

---

## Tech Stack & Architecture

**Backend:** Node.js + TypeScript + NestJS — chosen for its module structure, dependency injection, and built-in support for guards (role-based access) and interceptors (response transformation).

**Database:** PostgreSQL with Prisma ORM — Prisma's enum support maps directly to the application status state machine, and its migration workflow is production-appropriate.

**Frontend:** React + TypeScript + Vite — lightweight SPA with role-aware routing; no framework overhead beyond what's needed.

**Auth:** JWT (access token, short-lived) + role claim. Guards on every Officer route.

**File Uploads:** Multer (local disk for MVP); the storage adapter is abstracted so swapping to S3 requires only a config change.

The system follows a layered architecture: `Controller → Service → Repository (Prisma)`. Domain logic (status transitions, operator label mapping) lives in the service layer and is unit-tested independently of HTTP.

---

## What I Would Do Next

1. **UC3 multi-round clarification** — per-checklist-item conversation thread with full audit trail
2. **Real file storage** — S3 or Azure Blob with signed URLs for secure document access
3. **Real AI verification** — integrate a document verification API (e.g. AWS Textract or a custom ML endpoint); the stub is already wired into the upload flow
4. **Email notifications** — connect the `notifications` table to SendGrid or SES
5. **Officer assignment** — assign specific officers to applications to enforce workload distribution
6. **Pagination & filtering** — the officer application list needs server-side pagination for scale
7. **End-to-end tests** — Playwright tests covering the full submission → feedback → resubmission cycle
8. **Role-based UI hardening** — currently the frontend hides UI elements; add server-side enforcement of all data visibility rules as a second layer
