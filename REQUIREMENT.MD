# Software Engineering Assessment — Regulatory and Licensing Platform

## Overview

This assessment simulates real work: you are given product requirements, a time constraint, and the freedom to make engineering decisions. There is no single correct answer — we are evaluating how you think, what you prioritise, and how you build software that is ready for production.

The platform you are building is a **Regulatory and Licensing System** used by government licensing officers and operators (businesses seeking licences) to manage the end-to-end application lifecycle.

---

## At a Glance

| | |
|---|---|
| **Time Limit** | 3 days from receipt of this document |
| **Scope** | MVP — you decide what to build and what to defer |
| **Stack** | Your choice — justify your decisions in the README |
| **AI Tools** | Encouraged — document how you used them |
| **Deliverable** | GitHub repo (or zip) + README + SCOPE.md |

---

## What We Are Looking For

We are not looking for a complete system. We are looking for evidence that you can make good engineering decisions under constraints — and that you know how to work effectively with AI tools to ship quality software.

Think about what "production-ready" means to you and let that guide the choices you make. Not every feature needs to be built — but the things you do build should reflect how you would approach real work.

Where it makes sense, feel free to mock or stub. What matters is that the overall shape of the solution is coherent, and that your reasoning is clear.

---

## Scoping Your MVP

Before writing any code, you are recommended to come up with a short scoping proposal. This file, `SCOPE.md`, should be part of your Git repository and is a key part of the eventual assessment.

Your proposal should cover:

- Which use case(s) or features you are choosing to build — it is not a must to do all three
- What you are explicitly deferring or mocking, and why
- Any assumptions you are making where requirements are ambiguous
- Your intended tech stack and architecture in 3–5 sentences

> There are no wrong answers here — cutting scope deliberately is a senior engineering skill. We will assess the quality of your reasoning, not the quantity of features.

---

## Using AI Tools

You are encouraged to use AI coding assistants (e.g. Claude, GitHub Copilot, Cursor, ChatGPT). This reflects how we work day-to-day. However, the value of this assessment lies in **how** you use them — not whether you use them.

### What We Want to See

In your README, include a section called **AI Usage** that describes:

- Which tools you used and for what tasks
- Examples of prompts or instructions you gave the AI
- How you reviewed, validated, or corrected AI-generated output
- Any areas where the AI was unhelpful or produced code you discarded

### Guiding AI Effectively

Experienced engineers don't just paste requirements into an AI chat. They give AI the context it needs to produce production-quality output. Consider providing your AI tool with:

| Context Type | Example |
|---|---|
| **Data model / schema** | "Here is my Application entity and its status enum — generate a service method to transition status with validation" |
| **Coding standards** | "Use TypeScript strict mode. All async functions must handle errors explicitly. No `any` types." |
| **System constraints** | "Officers and Operators are different roles. Never expose the internal approval stage to Operators." |
| **Acceptance criteria** | "The operator must only see flagged checklist items, not the full checklist. Generate the API endpoint and response shape." |
| **Output format** | "Return the result as a class with dependency injection, following the repository pattern already in this codebase." |

> We will ask you about your AI usage during the debrief. Be honest — uncritical over-reliance on AI output is a red flag; thoughtful, verified use of AI is a strength.

---

## Use Cases

The following three use cases define the full product scope. You do not need to implement all of them — refer to the [Scoping Your MVP](#scoping-your-mvp) section above.

---

### Use Case 1 — Operator Application Submission & Resubmission

#### Background

Applications are often submitted with incomplete or incorrect information, causing repeated back-and-forth cycles. This use case covers the guided submission and resubmission workflow from the operator's perspective.

#### User Story

> As an Operator, I want to submit my application with clear guidance and receive specific feedback when information is incomplete, so that I can quickly address issues and resubmit without confusion or repeated rejections.

#### Acceptance Criteria

**Initial Submission**
- Complete form data entry
- Document uploads with drag-and-drop functionality
- Real-time AI verification status visible per uploaded document
- Progress indicator showing overall completion status

**Resubmission Workflow**
- Operator sees case status as `"Pending Pre-Site Resubmission"`
- Officer comments displayed prominently at top of application
- Feedback is linked to the specific form section or document it relates to
- Operator updates only the flagged sections — no need to re-enter entire application

**Multi-Round Support**
- Multiple rounds of feedback and resubmission are supported seamlessly
- Revision history and previous Officer comments are visible
- Application data is never lost between submission rounds

---

### Use Case 2 — Officer Application Review & Feedback

#### Background

Officers need an efficient way to review applications and provide actionable feedback without getting caught in repeated revision cycles.

#### User Story

> As a Licensing Officer, I want to efficiently review applications and provide clear, actionable feedback to operators, so that I can guide them toward complete submissions without repetitive review cycles.

#### Acceptance Criteria

**Application Review**
- Officer accesses full submission: all form data and documents in an organised structure
- AI verification results and flagged document issues are visible

**Feedback Workflow**
- Officer can request more information with specific, contextual comments
- Predefined comment templates available for common issues
- Setting application status triggers automatic operator notification

**Resubmission Management**
- Officer receives notification when case moves to `"Pre-Site Resubmitted"`
- Updated sections are highlighted; only changes are surfaced
- Officer can compare current submission against previous versions
- Resolution of previously flagged issues is tracked

**Quality Assurance**
- No applications are lost due to status transitions or filtering errors
- Complete audit trail of all feedback and resubmission rounds is maintained
- Workflow supports unlimited resubmission cycles

#### Status Mapping

All status transitions must follow the mapping below. Officer and Operator views show different labels for the same internal state.

| Internal System Status | Officer View | Operator View |
|---|---|---|
| Application Received | Application Received | Submitted |
| Under Review | Under Review | Under Review |
| Pending Pre-Site Resubmission | Pending Pre-Site Resubmission | Pending Pre-Site Resubmission |
| Pre-Site Resubmitted | Pre-Site Resubmitted | Pre-Site Resubmitted |
| Site Visit Scheduled | Site Visit Scheduled | Pending Site Visit |
| Site Visit Done | Site Visit Done | Pending Post-Site Clarification |
| Awaiting Post-Site Clarification | Awaiting Post-Site Clarification | Pending Post-Site Clarification |
| Pending Post-Site Resubmission | Awaiting Post-Site Resubmission | Pending Post-Site Resubmission |
| Post-Site Clarification Resubmitted | Post-Site Clarification Resubmitted | Post-Site Resubmitted |
| Pending Approval | Route to Approval | Pending Approval |
| Approved | Approved | Approved |
| Rejected | Rejected | Rejected |

---

### Use Case 3 — On-Site Assessment & Post-Site Clarification

#### Background

Site inspections need structured documentation, but inconsistent capture leads to unclear follow-ups. This use case covers the structured inspection workflow and targeted post-site clarification.

#### User Story

> As an Officer, I want to capture site visit findings and request clarification only on specific items, so that Operators can respond efficiently without being overwhelmed by the full inspection checklist.

#### Acceptance Criteria

**Officer — On-Site Data Capture**
- Officer accesses the full checklist after site visit is scheduled
- Officer inputs comments per checklist item
- Officer can save as draft (e.g. while working on an iPad on-site)
- Officer can mark individual items as `"Need Further Clarification"`

**Status Transition**
- On checklist submission, case automatically moves to `"Pending Post-Site Clarification"`

**Operator — Targeted Response**
- Operator does **NOT** see the full checklist
- Operator sees **ONLY** the items flagged for clarification
- Operator sees the Officer's comment per flagged item
- Operator can respond to each item and upload supporting documents

**Multi-Round Clarification**
- Multiple clarification rounds are supported per checklist item
- Each item maintains a full audit trail: comments, responses, timestamps

**Constraints**
- Operators cannot see the internal approval stage at any point
- Operators see only the final outcome: Approved or Rejected

---

## How You Will Be Evaluated

We will look at your submission as a whole — the code, your scoping decisions, how you used AI, and how you talk through it in the debrief. Areas we will consider include:

- **Scope judgement** — what you chose to build, defer, or mock, and why
- **Production readiness** — the quality and confidence of what you did ship
- **AI tool usage** — how effectively you guided and verified AI-generated output
- **Code quality** — structure, readability, and maintainability
- **Documentation** — clarity of your README and how well you communicate your decisions

---

## Submission Checklist

Before you submit, confirm you have:

- [ ] A working codebase that runs with the steps in your README
- [ ] A `SCOPE.md` in your Git repository explaining what you built, what you deferred, and why
- [ ] An **AI Usage** section documenting how you used AI tools
- [ ] Error handling and input validation on all key paths
- [ ] No secrets or credentials committed to the repository
- [ ] A **"What I would do next"** section noting known gaps or next priorities

---

> **A note on honesty:**
> You will be asked about your choices in a debrief. We value candidates who clearly understand the trade-offs they made — including where they cut corners — over candidates who submit more code but cannot explain it. If something is mocked, say so. If AI wrote something you are not fully confident in, say so. Clarity and self-awareness are strengths.

---

**Good luck!**

_If any requirement is unclear, state your assumption in writing and move on. To keep the assessment fair, we will not be responding to questions._