import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard, RolesGuard } from '../auth/guards';
import { Roles } from '../auth/roles.decorator';
import {
  AddFeedbackDto,
  CreateApplicationDto,
  ResubmitApplicationDto,
  UpdateStatusDto,
} from './applications.dto';
import { ApplicationsService } from './applications.service';

interface AuthUser {
  id: string;
  email: string;
  role: Role;
}

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('applications')
export class ApplicationsController {
  constructor(private readonly service: ApplicationsService) {}

  /** Operator: submit new application */
  @Roles('OPERATOR')
  @Post()
  create(@Body() dto: CreateApplicationDto, @CurrentUser() user: AuthUser) {
    return this.service.create(user.id, dto);
  }

  /** Both roles: list applications */
  @Get()
  findAll(@CurrentUser() user: AuthUser) {
    return this.service.findAll(user.id, user.role);
  }

  /** Both roles: get single application */
  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.service.findOne(id, user.id, user.role);
  }

  /** Officer: update status */
  @Roles('OFFICER')
  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateStatusDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.service.updateStatus(id, user.id, dto);
  }

  /** Officer: add feedback */
  @Roles('OFFICER')
  @Post(':id/feedback')
  addFeedback(
    @Param('id') id: string,
    @Body() dto: AddFeedbackDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.service.addFeedback(id, user.id, dto);
  }

  /** Operator: resubmit flagged sections */
  @Roles('OPERATOR')
  @Post(':id/resubmit')
  resubmit(
    @Param('id') id: string,
    @Body() dto: ResubmitApplicationDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.service.resubmit(id, user.id, dto);
  }

  /** Both roles: submission round history */
  @Get(':id/rounds')
  getRounds(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.service.getRounds(id, user.id, user.role);
  }

  /** Both roles: comment templates */
  @Get('meta/templates')
  getTemplates() {
    return this.service.getTemplates();
  }
}
