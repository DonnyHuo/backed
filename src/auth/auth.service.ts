import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { randomBytes } from 'crypto';

import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RequestNonceDto, VerifyWalletDto } from './dto/wallet-login.dto';
import { WalletVerificationService } from './services/wallet-verification.service';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly walletVerification: WalletVerificationService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, password, name } = registerDto;

    // Check if user already exists
    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await this.usersService.create({
      email,
      password: hashedPassword,
      name,
    });

    // Generate JWT token
    const token = this.generateToken(user.id, user.email, user.role);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
        bio: (user as any).bio,
      },
      accessToken: token,
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // Find user
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate JWT token
    const token = this.generateToken(user.id, user.email, user.role);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
        bio: (user as any).bio,
      },
      accessToken: token,
    };
  }

  async validateUser(payload: JwtPayload) {
    const user = await this.usersService.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return user;
  }

  /**
   * Request a nonce for wallet address to sign
   */
  async requestNonce(dto: RequestNonceDto) {
    const { address } = dto;
    const normalizedAddress = address.toLowerCase();

    // Validate address format
    if (!this.walletVerification.isValidAddress(address)) {
      throw new BadRequestException('Invalid Ethereum address format');
    }

    // Generate a random nonce
    const nonce = randomBytes(32).toString('hex');

    // Set expiration time (5 minutes from now)
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 5);

    // Find or create user with this wallet address
    let user = await this.prisma.user.findUnique({
      where: { walletAddress: normalizedAddress },
    });

    if (user) {
      // Update existing user's nonce
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          walletNonce: nonce,
          walletNonceExpiresAt: expiresAt,
        },
      });
    } else {
      // Create new user with wallet address
      user = await this.prisma.user.create({
        data: {
          walletAddress: normalizedAddress,
          walletNonce: nonce,
          walletNonceExpiresAt: expiresAt,
          name: `Wallet ${normalizedAddress.slice(0, 6)}...${normalizedAddress.slice(-4)}`,
        },
      });
    }

    // Generate the message that user needs to sign
    const message = this.walletVerification.generateNonceMessage(nonce);

    return {
      nonce,
      message,
      expiresAt,
    };
  }

  /**
   * Verify wallet signature and login/register
   */
  async verifyWallet(dto: VerifyWalletDto) {
    const { address, signature, nonce } = dto;
    const normalizedAddress = address.toLowerCase();

    // Find user by wallet address
    const user = await this.prisma.user.findUnique({
      where: { walletAddress: normalizedAddress },
    });

    if (!user) {
      throw new NotFoundException('No nonce found for this address. Please request a nonce first.');
    }

    // Verify nonce matches
    if (user.walletNonce !== nonce) {
      throw new UnauthorizedException('Invalid nonce');
    }

    // Check if nonce has expired
    if (!user.walletNonceExpiresAt || user.walletNonceExpiresAt < new Date()) {
      throw new UnauthorizedException('Nonce has expired. Please request a new one.');
    }

    // Verify signature
    const isValidSignature = await this.walletVerification.verifySignature(
      address,
      signature,
      nonce,
    );

    if (!isValidSignature) {
      throw new UnauthorizedException('Invalid signature');
    }

    // Clear nonce (one-time use)
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        walletNonce: null,
        walletNonceExpiresAt: null,
      },
    });

    // Generate JWT token
    // For wallet-only users, use wallet address as email identifier
    const email = user.email || `${normalizedAddress}@wallet.local`;
    const token = this.generateToken(user.id, email, user.role);

    return {
      user: {
        id: user.id,
        email: user.email,
        walletAddress: user.walletAddress,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
        bio: user.bio,
      },
      accessToken: token,
    };
  }

  private generateToken(userId: string, email: string, role: string): string {
    const payload: JwtPayload = {
      sub: userId,
      email,
      role,
    };
    return this.jwtService.sign(payload);
  }
}
