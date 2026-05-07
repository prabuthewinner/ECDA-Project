import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
interface AuthUser {
    id: string;
    role: Role;
}
export declare class DocumentsController {
    private readonly prisma;
    constructor(prisma: PrismaService);
    upload(appId: string, file: Express.Multer.File, sectionKey: string, user: AuthUser): Promise<{
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
    }>;
    findAll(appId: string, user: AuthUser): Promise<{
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
    }[]>;
}
export {};
