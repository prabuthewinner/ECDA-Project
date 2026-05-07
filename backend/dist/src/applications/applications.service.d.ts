import { Prisma, Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AddFeedbackDto, CreateApplicationDto, ResubmitApplicationDto, UpdateStatusDto } from './applications.dto';
export declare class ApplicationsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(operatorId: string, dto: CreateApplicationDto): Promise<{
        sections: {
            id: string;
            updatedAt: Date;
            data: Prisma.JsonValue;
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
    findAll(userId: string, role: Role): Promise<{
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
    findOne(id: string, userId: string, role: Role): Promise<{
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
            data: Prisma.JsonValue;
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
    updateStatus(id: string, officerId: string, dto: UpdateStatusDto): Promise<{
        statusLabel: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.ApplicationStatus;
        round: number;
        operatorId: string;
    }>;
    addFeedback(id: string, officerId: string, dto: AddFeedbackDto): Promise<{
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
    resubmit(id: string, operatorId: string, dto: ResubmitApplicationDto): Promise<{
        statusLabel: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.ApplicationStatus;
        round: number;
        operatorId: string;
    }>;
    getRounds(id: string, userId: string, role: Role): Promise<{
        id: string;
        round: number;
        snapshot: Prisma.JsonValue;
        submittedAt: Date;
        applicationId: string;
    }[]>;
    getTemplates(): Prisma.PrismaPromise<{
        id: string;
        createdAt: Date;
        sectionKey: string | null;
        text: string;
    }[]>;
}
