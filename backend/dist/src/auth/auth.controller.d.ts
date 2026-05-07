import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './auth.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    registerOperator(dto: RegisterDto): Promise<{
        accessToken: string;
        user: {
            id: string;
            email: string;
            role: import("@prisma/client").$Enums.Role;
        };
    }>;
    registerOfficer(dto: RegisterDto): Promise<{
        accessToken: string;
        user: {
            id: string;
            email: string;
            role: import("@prisma/client").$Enums.Role;
        };
    }>;
    login(dto: LoginDto): Promise<{
        accessToken: string;
        user: {
            id: string;
            email: string;
            role: import("@prisma/client").$Enums.Role;
        };
    }>;
    me(user: Express.User): Express.User;
}
