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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentsController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const path_1 = require("path");
const fs_1 = require("fs");
const client_1 = require("@prisma/client");
const current_user_decorator_1 = require("../auth/current-user.decorator");
const guards_1 = require("../auth/guards");
const roles_decorator_1 = require("../auth/roles.decorator");
const prisma_service_1 = require("../prisma/prisma.service");
const uploadDir = (0, path_1.join)(process.cwd(), 'uploads');
if (!(0, fs_1.existsSync)(uploadDir))
    (0, fs_1.mkdirSync)(uploadDir, { recursive: true });
let DocumentsController = class DocumentsController {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async upload(appId, file, sectionKey, user) {
        const app = await this.prisma.application.findUnique({ where: { id: appId } });
        if (!app)
            throw new common_1.NotFoundException('Application not found');
        if (app.operatorId !== user.id)
            throw new common_1.ForbiddenException('Access denied');
        const verificationStatus = 'VERIFIED';
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
    async findAll(appId, user) {
        const app = await this.prisma.application.findUnique({ where: { id: appId } });
        if (!app)
            throw new common_1.NotFoundException('Application not found');
        if (user.role === client_1.Role.OPERATOR && app.operatorId !== user.id) {
            throw new common_1.ForbiddenException('Access denied');
        }
        return this.prisma.document.findMany({ where: { applicationId: appId } });
    }
};
exports.DocumentsController = DocumentsController;
__decorate([
    (0, roles_decorator_1.Roles)('OPERATOR'),
    (0, common_1.Post)(),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        storage: (0, multer_1.diskStorage)({
            destination: uploadDir,
            filename: (_req, file, cb) => {
                const unique = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
                cb(null, `${unique}${(0, path_1.extname)(file.originalname)}`);
            },
        }),
        limits: { fileSize: 10 * 1024 * 1024 },
        fileFilter: (_req, file, cb) => {
            const allowed = ['.pdf', '.jpg', '.jpeg', '.png', '.docx'];
            const ext = (0, path_1.extname)(file.originalname).toLowerCase();
            cb(null, allowed.includes(ext));
        },
    })),
    __param(0, (0, common_1.Param)('appId')),
    __param(1, (0, common_1.UploadedFile)()),
    __param(2, (0, common_1.Body)('sectionKey')),
    __param(3, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String, Object]),
    __metadata("design:returntype", Promise)
], DocumentsController.prototype, "upload", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Param)('appId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], DocumentsController.prototype, "findAll", null);
exports.DocumentsController = DocumentsController = __decorate([
    (0, common_1.UseGuards)(guards_1.JwtAuthGuard, guards_1.RolesGuard),
    (0, common_1.Controller)('applications/:appId/documents'),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DocumentsController);
//# sourceMappingURL=documents.controller.js.map