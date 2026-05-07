"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OPERATOR_RESUBMIT_STATUSES = exports.ALLOWED_TRANSITIONS = exports.STATUS_LABEL_MAP = void 0;
exports.mapStatusLabel = mapStatusLabel;
const client_1 = require("@prisma/client");
exports.STATUS_LABEL_MAP = {
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
function mapStatusLabel(status, role) {
    return exports.STATUS_LABEL_MAP[status]?.[role === client_1.Role.OFFICER ? 'officer' : 'operator'] ?? status;
}
exports.ALLOWED_TRANSITIONS = {
    APPLICATION_RECEIVED: [client_1.ApplicationStatus.UNDER_REVIEW],
    UNDER_REVIEW: [
        client_1.ApplicationStatus.PENDING_PRE_SITE_RESUBMISSION,
        client_1.ApplicationStatus.SITE_VISIT_SCHEDULED,
        client_1.ApplicationStatus.REJECTED,
    ],
    PRE_SITE_RESUBMITTED: [
        client_1.ApplicationStatus.UNDER_REVIEW,
        client_1.ApplicationStatus.SITE_VISIT_SCHEDULED,
        client_1.ApplicationStatus.REJECTED,
    ],
    SITE_VISIT_SCHEDULED: [client_1.ApplicationStatus.SITE_VISIT_DONE],
    SITE_VISIT_DONE: [client_1.ApplicationStatus.AWAITING_POST_SITE_CLARIFICATION],
    AWAITING_POST_SITE_CLARIFICATION: [client_1.ApplicationStatus.PENDING_POST_SITE_RESUBMISSION],
    POST_SITE_CLARIFICATION_RESUBMITTED: [
        client_1.ApplicationStatus.PENDING_APPROVAL,
        client_1.ApplicationStatus.AWAITING_POST_SITE_CLARIFICATION,
    ],
    PENDING_APPROVAL: [client_1.ApplicationStatus.APPROVED, client_1.ApplicationStatus.REJECTED],
};
exports.OPERATOR_RESUBMIT_STATUSES = [
    client_1.ApplicationStatus.PENDING_PRE_SITE_RESUBMISSION,
    client_1.ApplicationStatus.PENDING_POST_SITE_RESUBMISSION,
];
//# sourceMappingURL=status.utils.js.map