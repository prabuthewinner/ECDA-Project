import { Role } from '@prisma/client';
import { AddFeedbackDto, CreateApplicationDto, ResubmitApplicationDto, UpdateStatusDto } from './applications.dto';
import { ApplicationsService } from './applications.service';
interface AuthUser {
    id: string;
    email: string;
    role: Role;
}
export declare class ApplicationsController {
    private readonly service;
    constructor(service: ApplicationsService);
    create(dto: CreateApplicationDto, user: AuthUser): Promise<{
        sections: {
            id: string;
            updatedAt: Date;
            data: import("@prisma/client/runtime/library").JsonValue;
            sectionKey: string;
            isFlagged: boolean;
            isUpdated: boolean;
            applicationId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.ApplicationStatus;
        round: number;
        operatorId: string;
    }>;
    findAll(user: AuthUser): Promise<{
        statusLabel: string;
        operator: {
            id: string;
            email: string;
            name: string;
        };
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.ApplicationStatus;
        round: number;
        operatorId: string;
    }[]>;
    findOne(id: string, user: AuthUser): Promise<{
        statusLabel: string;
        feedbacks: ({
            officer: {
                id: string;
                name: string;
            };
        } & {
            id: string;
            createdAt: Date;
            sectionKey: string | null;
            comment: string;
            documentId: string | null;
            templateId: string | null;
            round: number;
            applicationId: string;
            officerId: string;
            isResolved: boolean;
        })[];
        operator: {
            id: string;
            email: string;
            name: string;
        };
        sections: {
            id: string;
            updatedAt: Date;
            data: import("@prisma/client/runtime/library").JsonValue;
            sectionKey: string;
            isFlagged: boolean;
            isUpdated: boolean;
            applicationId: string;
        }[];
        documents: {
            id: string;
            sectionKey: string;
            isFlagged: boolean;
            applicationId: string;
            fileName: string;
            fileUrl: string;
            mimeType: string;
            sizeBytes: number;
            verificationStatus: import("@prisma/client").$Enums.DocumentVerificationStatus;
            verificationNote: string | null;
            uploadedAt: Date;
        }[];
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.ApplicationStatus;
        round: number;
        operatorId: string;
    }>;
    updateStatus(id: string, dto: UpdateStatusDto, user: AuthUser): Promise<{
        statusLabel: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.ApplicationStatus;
        round: number;
        operatorId: string;
    }>;
    addFeedback(id: string, dto: AddFeedbackDto, user: AuthUser): Promise<{
        id: string;
        createdAt: Date;
        sectionKey: string | null;
        comment: string;
        documentId: string | null;
        templateId: string | null;
        round: number;
        applicationId: string;
        officerId: string;
        isResolved: boolean;
    }>;
    resubmit(id: string, dto: ResubmitApplicationDto, user: AuthUser): Promise<{
        statusLabel: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.ApplicationStatus;
        round: number;
        operatorId: string;
    }>;
    getRounds(id: string, user: AuthUser): Promise<{
        id: string;
        round: number;
        snapshot: import("@prisma/client/runtime/library").JsonValue;
        submittedAt: Date;
        applicationId: string;
    }[]>;
    getTemplates(): import("@prisma/client").Prisma.PrismaPromise<{
        id: string;
        createdAt: Date;
        sectionKey: string | null;
        text: string;
    }[]>;
}
export {};
