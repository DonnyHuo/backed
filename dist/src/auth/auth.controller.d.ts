import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(registerDto: RegisterDto): Promise<{
        user: {
            id: any;
            email: any;
            name: any;
            role: any;
        };
        accessToken: string;
    }>;
    login(loginDto: LoginDto): Promise<{
        user: {
            id: any;
            email: any;
            name: any;
            role: any;
        };
        accessToken: string;
    }>;
    getProfile(user: any): Promise<{
        id: any;
        email: any;
        name: any;
        role: any;
        createdAt: any;
    }>;
}
