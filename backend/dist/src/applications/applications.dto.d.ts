import { ApplicationStatus } from '@prisma/client';
export declare class CreateApplicationDto {
    business_details: Record<string, unknown>;
    owner_info: Record<string, unknown>;
    premises_info: Record<string, unknown>;
    licence_details?: Record<string, unknown>;
}
export declare class ResubmitApplicationDto {
    business_details?: Record<string, unknown>;
    owner_info?: Record<string, unknown>;
    premises_info?: Record<string, unknown>;
    licence_details?: Record<string, unknown>;
}
export declare class UpdateStatusDto {
    status: ApplicationStatus;
    note?: string;
}
export declare class AddFeedbackDto {
    comment: string;
    sectionKey?: string;
    documentId?: string;
    templateId?: string;
}
