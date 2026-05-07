import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './auth.dto';
import { JwtAuthGuard } from './guards';
import { CurrentUser } from './current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register/operator')
  registerOperator(@Body() dto: RegisterDto) {
    return this.authService.register(dto, Role.OPERATOR);
  }

  @Post('register/officer')
  registerOfficer(@Body() dto: RegisterDto) {
    return this.authService.register(dto, Role.OFFICER);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('me')
  me(@CurrentUser() user: Express.User) {
    return user;
  }
}
