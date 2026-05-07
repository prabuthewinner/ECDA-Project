import { ApplicationStatus, Role } from '@prisma/client';
export declare const STATUS_LABEL_MAP: Record<ApplicationStatus, {
    officer: string;
    operator: string;
}>;
export declare function mapStatusLabel(status: ApplicationStatus, role: Role): string;
export declare const ALLOWED_TRANSITIONS: Partial<Record<ApplicationStatus, ApplicationStatus[]>>;
export declare const OPERATOR_RESUBMIT_STATUSES: ApplicationStatus[];
