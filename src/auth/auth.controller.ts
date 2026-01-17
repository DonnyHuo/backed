import { Controller, Post, Body, Get, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RequestNonceDto, VerifyWalletDto } from './dto/wallet-login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  @ApiResponse({ status: 409, description: 'User already exists' })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User login' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('wallet/nonce')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request nonce for wallet address to sign' })
  @ApiResponse({
    status: 200,
    description: 'Returns nonce and message to sign',
  })
  @ApiResponse({ status: 400, description: 'Invalid address format' })
  async requestNonce(@Body() dto: RequestNonceDto) {
    return this.authService.requestNonce(dto);
  }

  @Post('wallet/verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify wallet signature and login/register' })
  @ApiResponse({
    status: 200,
    description: 'Login successful, returns user and access token',
  })
  @ApiResponse({ status: 401, description: 'Invalid signature or expired nonce' })
  @ApiResponse({ status: 404, description: 'No nonce found for this address' })
  async verifyWallet(@Body() dto: VerifyWalletDto) {
    return this.authService.verifyWallet(dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Returns current user' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getProfile(@CurrentUser() user: any) {
    return {
      id: user.id,
      email: user.email,
      walletAddress: user.walletAddress,
      name: user.name,
      role: user.role,
      avatar: user.avatar,
      bio: user.bio,
      createdAt: user.createdAt,
    };
  }
}
