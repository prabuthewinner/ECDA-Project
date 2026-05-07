"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApplicationsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
const status_utils_1 = require("./status.utils");
let ApplicationsService = class ApplicationsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(operatorId, dto) {
        const { business_details, owner_info, premises_info, licence_details } = dto;
        const app = await this.prisma.application.create({
            data: {
                operatorId,
                status: client_1.ApplicationStatus.APPLICATION_RECEIVED,
                round: 1,
                sections: {
                    create: [
                        {
                            sectionKey: 'business_details',
                            data: business_details,
                        },
                        { sectionKey: 'owner_info', data: owner_info },
                        {
                            sectionKey: 'premises_info',
                            data: premises_info,
                        },
                        ...(licence_details
                            ? [
                                {
                                    sectionKey: 'licence_details',
                                    data: licence_details,
                                },
                            ]
                            : []),
                    ],
                },
                submissionRounds: {
                    create: {
                        round: 1,
                        snapshot: {
                            business_details,
                            owner_info,
                            premises_info,
                            licence_details,
                        },
                    },
                },
            },
            include: { sections: true },
        });
        return app;
    }
    async findAll(userId, role) {
        const where = role === client_1.Role.OPERATOR ? { operatorId: userId } : {};
        const apps = await this.prisma.application.findMany({
            where,
            orderBy: { updatedAt: 'desc' },
            include: { operator: { select: { id: true, name: true, email: true } } },
        });
        return apps.map((a) => ({
            ...a,
            statusLabel: (0, status_utils_1.mapStatusLabel)(a.status, role),
        }));
    }
    async findOne(id, userId, role) {
        const app = await this.prisma.application.findUnique({
            where: { id },
            include: {
                sections: true,
                documents: true,
                feedbacks: {
                    include: { officer: { select: { id: true, name: true } } },
                    orderBy: { createdAt: 'asc' },
                },
                operator: { select: { id: true, name: true, email: true } },
            },
        });
        if (!app)
            throw new common_1.NotFoundException('Application not found');
        if (role === client_1.Role.OPERATOR && app.operatorId !== userId) {
            throw new common_1.ForbiddenException('Access denied');
        }
        return {
            ...app,
            statusLabel: (0, status_utils_1.mapStatusLabel)(app.status, role),
        };
    }
    async updateStatus(id, officerId, dto) {
        const app = await this.prisma.application.findUnique({ where: { id } });
        if (!app)
            throw new common_1.NotFoundException('Application not found');
        const allowed = status_utils_1.ALLOWED_TRANSITIONS[app.status] ?? [];
        if (!allowed.includes(dto.status)) {
            throw new common_1.BadRequestException(`Cannot transition from ${app.status} to ${dto.status}`);
        }
        const updated = await this.prisma.application.update({
            where: { id },
            data: { status: dto.status },
        });
        await this.prisma.notification.create({
            data: {
                userId: app.operatorId,
                applicationId: id,
                type: client_1.NotificationType.STATUS_CHANGED,
                message: `Your application status has been updated to: ${(0, status_utils_1.mapStatusLabel)(dto.status, client_1.Role.OPERATOR)}`,
            },
        });
        return { ...updated, statusLabel: (0, status_utils_1.mapStatusLabel)(updated.status, client_1.Role.OFFICER) };
    }
    async addFeedback(id, officerId, dto) {
        const app = await this.prisma.application.findUnique({ where: { id } });
        if (!app)
            throw new common_1.NotFoundException('Application not found');
        const feedback = await this.prisma.officerFeedback.create({
            data: {
                applicationId: id,
                officerId,
                round: app.round,
                sectionKey: dto.sectionKey,
                documentId: dto.documentId,
                templateId: dto.templateId,
                comment: dto.comment,
            },
        });
        if (dto.sectionKey) {
            await this.prisma.applicationSection.updateMany({
                where: { applicationId: id, sectionKey: dto.sectionKey },
                data: { isFlagged: true },
            });
        }
        await this.prisma.notification.create({
            data: {
                userId: app.operatorId,
                applicationId: id,
                type: client_1.NotificationType.FEEDBACK_ADDED,
                message: dto.sectionKey
                    ? `Officer added feedback on section: ${dto.sectionKey}`
                    : 'Officer added feedback on your application',
            },
        });
        return feedback;
    }
    async resubmit(id, operatorId, dto) {
        const app = await this.prisma.application.findUnique({
            where: { id },
            include: { sections: true },
        });
        if (!app)
            throw new common_1.NotFoundException('Application not found');
        if (app.operatorId !== operatorId)
            throw new common_1.ForbiddenException('Access denied');
        if (!status_utils_1.OPERATOR_RESUBMIT_STATUSES.includes(app.status)) {
            throw new common_1.BadRequestException('Application is not pending resubmission');
        }
        const newRound = app.round + 1;
        const sectionUpdates = [];
        for (const [key, data] of Object.entries(dto)) {
            if (!data)
                continue;
            sectionUpdates.push(this.prisma.applicationSection.upsert({
                where: { applicationId_sectionKey: { applicationId: id, sectionKey: key } },
                update: {
                    data: data,
                    isFlagged: false,
                    isUpdated: true,
                },
                create: {
                    applicationId: id,
                    sectionKey: key,
                    data: data,
                },
            }));
        }
        await this.prisma.applicationSection.updateMany({
            where: { applicationId: id },
            data: { isUpdated: false },
        });
        await Promise.all(sectionUpdates);
        const newStatus = app.status === client_1.ApplicationStatus.PENDING_PRE_SITE_RESUBMISSION
            ? client_1.ApplicationStatus.PRE_SITE_RESUBMITTED
            : client_1.ApplicationStatus.POST_SITE_CLARIFICATION_RESUBMITTED;
        const allSections = await this.prisma.applicationSection.findMany({
            where: { applicationId: id },
        });
        const snapshot = Object.fromEntries(allSections.map((s) => [s.sectionKey, s.data]));
        const [updated] = await this.prisma.$transaction([
            this.prisma.application.update({
                where: { id },
                data: { status: newStatus, round: newRound },
            }),
            this.prisma.submissionRound.create({
                data: {
                    applicationId: id,
                    round: newRound,
                    snapshot: snapshot,
                },
            }),
        ]);
        return { ...updated, statusLabel: (0, status_utils_1.mapStatusLabel)(updated.status, client_1.Role.OPERATOR) };
    }
    async getRounds(id, userId, role) {
        const app = await this.prisma.application.findUnique({ where: { id } });
        if (!app)
            throw new common_1.NotFoundException('Application not found');
        if (role === client_1.Role.OPERATOR && app.operatorId !== userId) {
            throw new common_1.ForbiddenException('Access denied');
        }
        return this.prisma.submissionRound.findMany({
            where: { applicationId: id },
            orderBy: { round: 'asc' },
        });
    }
    getTemplates() {
        return this.prisma.commentTemplate.findMany({ orderBy: { sectionKey: 'asc' } });
    }
};
exports.ApplicationsService = ApplicationsService;
exports.ApplicationsService = ApplicationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ApplicationsService);
//# sourceMappingURL=applications.service.js.map