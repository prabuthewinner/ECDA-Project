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
exports.ApplicationsController = void 0;
const common_1 = require("@nestjs/common");
const current_user_decorator_1 = require("../auth/current-user.decorator");
const guards_1 = require("../auth/guards");
const roles_decorator_1 = require("../auth/roles.decorator");
const applications_dto_1 = require("./applications.dto");
const applications_service_1 = require("./applications.service");
let ApplicationsController = class ApplicationsController {
    service;
    constructor(service) {
        this.service = service;
    }
    create(dto, user) {
        return this.service.create(user.id, dto);
    }
    findAll(user) {
        return this.service.findAll(user.id, user.role);
    }
    findOne(id, user) {
        return this.service.findOne(id, user.id, user.role);
    }
    updateStatus(id, dto, user) {
        return this.service.updateStatus(id, user.id, dto);
    }
    addFeedback(id, dto, user) {
        return this.service.addFeedback(id, user.id, dto);
    }
    resubmit(id, dto, user) {
        return this.service.resubmit(id, user.id, dto);
    }
    getRounds(id, user) {
        return this.service.getRounds(id, user.id, user.role);
    }
    getTemplates() {
        return this.service.getTemplates();
    }
};
exports.ApplicationsController = ApplicationsController;
__decorate([
    (0, roles_decorator_1.Roles)('OPERATOR'),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [applications_dto_1.CreateApplicationDto, Object]),
    __metadata("design:returntype", void 0)
], ApplicationsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ApplicationsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ApplicationsController.prototype, "findOne", null);
__decorate([
    (0, roles_decorator_1.Roles)('OFFICER'),
    (0, common_1.Patch)(':id/status'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, applications_dto_1.UpdateStatusDto, Object]),
    __metadata("design:returntype", void 0)
], ApplicationsController.prototype, "updateStatus", null);
__decorate([
    (0, roles_decorator_1.Roles)('OFFICER'),
    (0, common_1.Post)(':id/feedback'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, applications_dto_1.AddFeedbackDto, Object]),
    __metadata("design:returntype", void 0)
], ApplicationsController.prototype, "addFeedback", null);
__decorate([
    (0, roles_decorator_1.Roles)('OPERATOR'),
    (0, common_1.Post)(':id/resubmit'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, applications_dto_1.ResubmitApplicationDto, Object]),
    __metadata("design:returntype", void 0)
], ApplicationsController.prototype, "resubmit", null);
__decorate([
    (0, common_1.Get)(':id/rounds'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ApplicationsController.prototype, "getRounds", null);
__decorate([
    (0, common_1.Get)('meta/templates'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ApplicationsController.prototype, "getTemplates", null);
exports.ApplicationsController = ApplicationsController = __decorate([
    (0, common_1.UseGuards)(guards_1.JwtAuthGuard, guards_1.RolesGuard),
    (0, common_1.Controller)('applications'),
    __metadata("design:paramtypes", [applications_service_1.ApplicationsService])
], ApplicationsController);
//# sourceMappingURL=applications.controller.js.map