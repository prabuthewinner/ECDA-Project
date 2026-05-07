import { PrismaService } from '../prisma/prisma.service';
interface AuthUser {
    id: string;
}
export declare class NotificationsController {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(user: AuthUser): import("@prisma/client").Prisma.PrismaPromise<{
        id: string;
        createdAt: Date;
        applicationId: string | null;
        type: import("@prisma/client").$Enums.NotificationType;
        message: string;
        isRead: boolean;
        userId: string;
    }[]>;
    markRead(id: string, user: AuthUser): import("@prisma/client").Prisma.PrismaPromise<import("@prisma/client").Prisma.BatchPayload>;
    markAllRead(user: AuthUser): import("@prisma/client").Prisma.PrismaPromise<import("@prisma/client").Prisma.BatchPayload>;
}
export {};
