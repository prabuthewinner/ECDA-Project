import { ApplicationStatus, Role } from '@prisma/client';

/** Maps internal ApplicationStatus to the label shown to each role */
export const STATUS_LABEL_MAP: Record<
  ApplicationStatus,
  { officer: string; operator: string }
> = {
  APPLICATION_RECEIVED: {
    officer: 'Application Received',
    operator: 'Submitted',
  },
  UNDER_REVIEW: {
    officer: 'Under Review',
    operator: 'Under Review',
  },
  PENDING_PRE_SITE_RESUBMISSION: {
    officer: 'Pending Pre-Site Resubmission',
    operator: 'Pending Pre-Site Resubmission',
  },
  PRE_SITE_RESUBMITTED: {
    officer: 'Pre-Site Resubmitted',
    operator: 'Pre-Site Resubmitted',
  },
  SITE_VISIT_SCHEDULED: {
    officer: 'Site Visit Scheduled',
    operator: 'Pending Site Visit',
  },
  SITE_VISIT_DONE: {
    officer: 'Site Visit Done',
    operator: 'Pending Post-Site Clarification',
  },
  AWAITING_POST_SITE_CLARIFICATION: {
    officer: 'Awaiting Post-Site Clarification',
    operator: 'Pending Post-Site Clarification',
  },
  PENDING_POST_SITE_RESUBMISSION: {
    officer: 'Awaiting Post-Site Resubmission',
    operator: 'Pending Post-Site Resubmission',
  },
  POST_SITE_CLARIFICATION_RESUBMITTED: {
    officer: 'Post-Site Clarification Resubmitted',
    operator: 'Post-Site Resubmitted',
  },
  PENDING_APPROVAL: {
    officer: 'Route to Approval',
    operator: 'Pending Approval',
  },
  APPROVED: {
    officer: 'Approved',
    operator: 'Approved',
  },
  REJECTED: {
    officer: 'Rejected',
    operator: 'Rejected',
  },
};

export function mapStatusLabel(status: ApplicationStatus, role: Role): string {
  return STATUS_LABEL_MAP[status]?.[role === Role.OFFICER ? 'officer' : 'operator'] ?? status;
}

/** Valid status transitions an officer can make */
export const ALLOWED_TRANSITIONS: Partial<Record<ApplicationStatus, ApplicationStatus[]>> = {
  APPLICATION_RECEIVED: [ApplicationStatus.UNDER_REVIEW],
  UNDER_REVIEW: [
    ApplicationStatus.PENDING_PRE_SITE_RESUBMISSION,
    ApplicationStatus.SITE_VISIT_SCHEDULED,
    ApplicationStatus.REJECTED,
  ],
  PRE_SITE_RESUBMITTED: [
    ApplicationStatus.UNDER_REVIEW,
    ApplicationStatus.SITE_VISIT_SCHEDULED,
    ApplicationStatus.REJECTED,
  ],
  SITE_VISIT_SCHEDULED: [ApplicationStatus.SITE_VISIT_DONE],
  SITE_VISIT_DONE: [ApplicationStatus.AWAITING_POST_SITE_CLARIFICATION],
  AWAITING_POST_SITE_CLARIFICATION: [ApplicationStatus.PENDING_POST_SITE_RESUBMISSION],
  POST_SITE_CLARIFICATION_RESUBMITTED: [
    ApplicationStatus.PENDING_APPROVAL,
    ApplicationStatus.AWAITING_POST_SITE_CLARIFICATION,
  ],
  PENDING_APPROVAL: [ApplicationStatus.APPROVED, ApplicationStatus.REJECTED],
};

/** Statuses from which an operator can resubmit */
export const OPERATOR_RESUBMIT_STATUSES: ApplicationStatus[] = [
  ApplicationStatus.PENDING_PRE_SITE_RESUBMISSION,
  ApplicationStatus.PENDING_POST_SITE_RESUBMISSION,
];
