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
exports.AddFeedbackDto = exports.UpdateStatusDto = exports.ResubmitApplicationDto = exports.CreateApplicationDto = void 0;
const client_1 = require("@prisma/client");
const class_validator_1 = require("class-validator");
class CreateApplicationDto {
    business_details;
    owner_info;
    premises_info;
    licence_details;
}
exports.CreateApplicationDto = CreateApplicationDto;
__decorate([
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], CreateApplicationDto.prototype, "business_details", void 0);
__decorate([
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], CreateApplicationDto.prototype, "owner_info", void 0);
__decorate([
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], CreateApplicationDto.prototype, "premises_info", void 0);
__decorate([
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreateApplicationDto.prototype, "licence_details", void 0);
class ResubmitApplicationDto {
    business_details;
    owner_info;
    premises_info;
    licence_details;
}
exports.ResubmitApplicationDto = ResubmitApplicationDto;
__decorate([
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], ResubmitApplicationDto.prototype, "business_details", void 0);
__decorate([
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], ResubmitApplicationDto.prototype, "owner_info", void 0);
__decorate([
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], ResubmitApplicationDto.prototype, "premises_info", void 0);
__decorate([
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], ResubmitApplicationDto.prototype, "licence_details", void 0);
class UpdateStatusDto {
    status;
    note;
}
exports.UpdateStatusDto = UpdateStatusDto;
__decorate([
    (0, class_validator_1.IsEnum)(client_1.ApplicationStatus),
    __metadata("design:type", String)
], UpdateStatusDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateStatusDto.prototype, "note", void 0);
class AddFeedbackDto {
    comment;
    sectionKey;
    documentId;
    templateId;
}
exports.AddFeedbackDto = AddFeedbackDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], AddFeedbackDto.prototype, "comment", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], AddFeedbackDto.prototype, "sectionKey", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], AddFeedbackDto.prototype, "documentId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], AddFeedbackDto.prototype, "templateId", void 0);
//# sourceMappingURL=applications.dto.js.map