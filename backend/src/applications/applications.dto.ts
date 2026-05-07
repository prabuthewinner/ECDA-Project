import { ApplicationStatus } from '@prisma/client';
import {
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateApplicationDto {
  @IsObject()
  business_details: Record<string, unknown>;

  @IsObject()
  owner_info: Record<string, unknown>;

  @IsObject()
  premises_info: Record<string, unknown>;

  @IsObject()
  @IsOptional()
  licence_details?: Record<string, unknown>;
}

export class ResubmitApplicationDto {
  @IsObject()
  @IsOptional()
  business_details?: Record<string, unknown>;

  @IsObject()
  @IsOptional()
  owner_info?: Record<string, unknown>;

  @IsObject()
  @IsOptional()
  premises_info?: Record<string, unknown>;

  @IsObject()
  @IsOptional()
  licence_details?: Record<string, unknown>;
}

export class UpdateStatusDto {
  @IsEnum(ApplicationStatus)
  status: ApplicationStatus;

  @IsString()
  @IsOptional()
  note?: string;
}

export class AddFeedbackDto {
  @IsString()
  @IsNotEmpty()
  comment: string;

  @IsString()
  @IsOptional()
  sectionKey?: string;

  @IsString()
  @IsOptional()
  documentId?: string;

  @IsString()
  @IsOptional()
  templateId?: string;
}
