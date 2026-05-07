import {
  Controller,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { Role } from '@prisma/client';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard, RolesGuard } from '../auth/guards';
import { Roles } from '../auth/roles.decorator';
import { PrismaService } from '../prisma/prisma.service';

interface AuthUser {
  id: string;
  role: Role;
}

const uploadDir = join(process.cwd(), 'uploads');
if (!existsSync(uploadDir)) mkdirSync(uploadDir, { recursive: true });

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('applications/:appId/documents')
export class DocumentsController {
  constructor(private readonly prisma: PrismaService) {}

  /** Operator: upload a document */
  @Roles('OPERATOR')
  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: uploadDir,
        filename: (_req, file, cb) => {
          const unique = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
          cb(null, `${unique}${extname(file.originalname)}`);
        },
      }),
      limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
      fileFilter: (_req, file, cb) => {
        const allowed = ['.pdf', '.jpg', '.jpeg', '.png', '.docx'];
        const ext = extname(file.originalname).toLowerCase();
        cb(null, allowed.includes(ext));
      },
    }),
  )
  async upload(
    @Param('appId') appId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body('sectionKey') sectionKey: string,
    @CurrentUser() user: AuthUser,
  ) {
    const app = await this.prisma.application.findUnique({ where: { id: appId } });
    if (!app) throw new NotFoundException('Application not found');
    if (app.operatorId !== user.id) throw new ForbiddenException('Access denied');

    // Mock AI verification — would call real service in production
    const verificationStatus = 'VERIFIED' as const;
    const verificationNote = 'Document verified successfully (mocked)';

    return this.prisma.document.create({
      data: {
        applicationId: appId,
        sectionKey: sectionKey ?? 'general',
        fileName: file.originalname,
        fileUrl: `/uploads/${file.filename}`,
        mimeType: file.mimetype,
        sizeBytes: file.size,
        verificationStatus,
        verificationNote,
      },
    });
  }

  /** Both roles: list documents for an application */
  @Get()
  async findAll(@Param('appId') appId: string, @CurrentUser() user: AuthUser) {
    const app = await this.prisma.application.findUnique({ where: { id: appId } });
    if (!app) throw new NotFoundException('Application not found');
    if (user.role === Role.OPERATOR && app.operatorId !== user.id) {
      throw new ForbiddenException('Access denied');
    }

    return this.prisma.document.findMany({ where: { applicationId: appId } });
  }
}
