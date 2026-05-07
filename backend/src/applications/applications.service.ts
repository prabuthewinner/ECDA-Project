import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ApplicationStatus, NotificationType, Prisma, Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  AddFeedbackDto,
  CreateApplicationDto,
  ResubmitApplicationDto,
  UpdateStatusDto,
} from './applications.dto';
import {
  ALLOWED_TRANSITIONS,
  mapStatusLabel,
  OPERATOR_RESUBMIT_STATUSES,
} from './status.utils';

@Injectable()
export class ApplicationsService {
  constructor(private readonly prisma: PrismaService) {}

  // ─── Create ───────────────────────────────────────────────────────────────

  async create(operatorId: string, dto: CreateApplicationDto) {
    const { business_details, owner_info, premises_info, licence_details } = dto;

    const app = await this.prisma.application.create({
      data: {
        operatorId,
        status: ApplicationStatus.APPLICATION_RECEIVED,
        round: 1,
        sections: {
          create: [
            {
              sectionKey: 'business_details',
              data: business_details as Prisma.InputJsonValue,
            },
            { sectionKey: 'owner_info', data: owner_info as Prisma.InputJsonValue },
            {
              sectionKey: 'premises_info',
              data: premises_info as Prisma.InputJsonValue,
            },
            ...(licence_details
              ? [
                  {
                    sectionKey: 'licence_details',
                    data: licence_details as Prisma.InputJsonValue,
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
            } as Prisma.InputJsonValue,
          },
        },
      },
      include: { sections: true },
    });

    return app;
  }

  // ─── List ─────────────────────────────────────────────────────────────────

  async findAll(userId: string, role: Role) {
    const where = role === Role.OPERATOR ? { operatorId: userId } : {};
    const apps = await this.prisma.application.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      include: { operator: { select: { id: true, name: true, email: true } } },
    });

    return apps.map((a) => ({
      ...a,
      statusLabel: mapStatusLabel(a.status, role),
    }));
  }

  // ─── Get one ──────────────────────────────────────────────────────────────

  async findOne(id: string, userId: string, role: Role) {
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

    if (!app) throw new NotFoundException('Application not found');
    if (role === Role.OPERATOR && app.operatorId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return {
      ...app,
      statusLabel: mapStatusLabel(app.status, role),
    };
  }

  // ─── Update status (Officer only) ─────────────────────────────────────────

  async updateStatus(id: string, officerId: string, dto: UpdateStatusDto) {
    const app = await this.prisma.application.findUnique({ where: { id } });
    if (!app) throw new NotFoundException('Application not found');

    const allowed = ALLOWED_TRANSITIONS[app.status] ?? [];
    if (!allowed.includes(dto.status)) {
      throw new BadRequestException(
        `Cannot transition from ${app.status} to ${dto.status}`,
      );
    }

    const updated = await this.prisma.application.update({
      where: { id },
      data: { status: dto.status },
    });

    // Notify operator
    await this.prisma.notification.create({
      data: {
        userId: app.operatorId,
        applicationId: id,
        type: NotificationType.STATUS_CHANGED,
        message: `Your application status has been updated to: ${mapStatusLabel(dto.status, Role.OPERATOR)}`,
      },
    });

    return { ...updated, statusLabel: mapStatusLabel(updated.status, Role.OFFICER) };
  }

  // ─── Add feedback (Officer only) ──────────────────────────────────────────

  async addFeedback(id: string, officerId: string, dto: AddFeedbackDto) {
    const app = await this.prisma.application.findUnique({ where: { id } });
    if (!app) throw new NotFoundException('Application not found');

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

    // Flag the section
    if (dto.sectionKey) {
      await this.prisma.applicationSection.updateMany({
        where: { applicationId: id, sectionKey: dto.sectionKey },
        data: { isFlagged: true },
      });
    }

    // Notify operator
    await this.prisma.notification.create({
      data: {
        userId: app.operatorId,
        applicationId: id,
        type: NotificationType.FEEDBACK_ADDED,
        message: dto.sectionKey
          ? `Officer added feedback on section: ${dto.sectionKey}`
          : 'Officer added feedback on your application',
      },
    });

    return feedback;
  }

  // ─── Resubmit (Operator only) ─────────────────────────────────────────────

  async resubmit(id: string, operatorId: string, dto: ResubmitApplicationDto) {
    const app = await this.prisma.application.findUnique({
      where: { id },
      include: { sections: true },
    });

    if (!app) throw new NotFoundException('Application not found');
    if (app.operatorId !== operatorId) throw new ForbiddenException('Access denied');

    if (!OPERATOR_RESUBMIT_STATUSES.includes(app.status)) {
      throw new BadRequestException('Application is not pending resubmission');
    }

    const newRound = app.round + 1;
    const sectionUpdates: Promise<unknown>[] = [];

    for (const [key, data] of Object.entries(dto)) {
      if (!data) continue;
      sectionUpdates.push(
        this.prisma.applicationSection.upsert({
          where: { applicationId_sectionKey: { applicationId: id, sectionKey: key } },
          update: {
            data: data as Prisma.InputJsonValue,
            isFlagged: false,
            isUpdated: true,
          },
          create: {
            applicationId: id,
            sectionKey: key,
            data: data as Prisma.InputJsonValue,
          },
        }),
      );
    }

    // Clear isUpdated on non-touched sections
    await this.prisma.applicationSection.updateMany({
      where: { applicationId: id },
      data: { isUpdated: false },
    });

    await Promise.all(sectionUpdates);

    // Determine new status
    const newStatus =
      app.status === ApplicationStatus.PENDING_PRE_SITE_RESUBMISSION
        ? ApplicationStatus.PRE_SITE_RESUBMITTED
        : ApplicationStatus.POST_SITE_CLARIFICATION_RESUBMITTED;

    // Build snapshot
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
          snapshot: snapshot as Prisma.InputJsonValue,
        },
      }),
    ]);

    return { ...updated, statusLabel: mapStatusLabel(updated.status, Role.OPERATOR) };
  }

  // ─── Submission rounds (history) ──────────────────────────────────────────

  async getRounds(id: string, userId: string, role: Role) {
    const app = await this.prisma.application.findUnique({ where: { id } });
    if (!app) throw new NotFoundException('Application not found');
    if (role === Role.OPERATOR && app.operatorId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return this.prisma.submissionRound.findMany({
      where: { applicationId: id },
      orderBy: { round: 'asc' },
    });
  }

  // ─── Comment templates ────────────────────────────────────────────────────

  getTemplates() {
    return this.prisma.commentTemplate.findMany({ orderBy: { sectionKey: 'asc' } });
  }
}
