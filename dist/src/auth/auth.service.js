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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = require("bcryptjs");
const prisma_service_1 = require("../prisma/prisma.service");
const crypto_1 = require("crypto");
const users_service_1 = require("../users/users.service");
const wallet_verification_service_1 = require("./services/wallet-verification.service");
let AuthService = class AuthService {
    constructor(usersService, jwtService, prisma, walletVerification) {
        this.usersService = usersService;
        this.jwtService = jwtService;
        this.prisma = prisma;
        this.walletVerification = walletVerification;
    }
    async register(registerDto) {
        const { email, password, name } = registerDto;
        const existingUser = await this.usersService.findByEmail(email);
        if (existingUser) {
            throw new common_1.ConflictException('User with this email already exists');
        }
        const hashedPassword = await bcrypt.hash(password, 12);
        const user = await this.usersService.create({
            email,
            password: hashedPassword,
            name,
        });
        if (!user.email) {
            throw new common_1.ConflictException('User email is required');
        }
        const token = this.generateToken(user.id, user.email, user.role);
        return {
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                avatar: user.avatar,
                bio: user.bio,
            },
            accessToken: token,
        };
    }
    async login(loginDto) {
        const { email, password } = loginDto;
        const user = await this.usersService.findByEmail(email);
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        if (!user.password) {
            throw new common_1.UnauthorizedException('This account uses wallet login. Please use wallet authentication.');
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        if (!user.email) {
            throw new common_1.UnauthorizedException('User email is required');
        }
        const token = this.generateToken(user.id, user.email, user.role);
        return {
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                avatar: user.avatar,
                bio: user.bio,
            },
            accessToken: token,
        };
    }
    async validateUser(payload) {
        const user = await this.usersService.findById(payload.sub);
        if (!user) {
            throw new common_1.UnauthorizedException('User not found');
        }
        return user;
    }
    async requestNonce(dto) {
        const { address } = dto;
        const normalizedAddress = address.toLowerCase();
        if (!this.walletVerification.isValidAddress(address)) {
            throw new common_1.BadRequestException('Invalid Ethereum address format');
        }
        const nonce = (0, crypto_1.randomBytes)(32).toString('hex');
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + 5);
        let user = await this.prisma.user.findUnique({
            where: { walletAddress: normalizedAddress },
        });
        if (user) {
            await this.prisma.user.update({
                where: { id: user.id },
                data: {
                    walletNonce: nonce,
                    walletNonceExpiresAt: expiresAt,
                },
            });
        }
        else {
            user = await this.prisma.user.create({
                data: {
                    walletAddress: normalizedAddress,
                    walletNonce: nonce,
                    walletNonceExpiresAt: expiresAt,
                    name: `Wallet ${normalizedAddress.slice(0, 6)}...${normalizedAddress.slice(-4)}`,
                },
            });
        }
        const message = this.walletVerification.generateNonceMessage(nonce);
        return {
            nonce,
            message,
            expiresAt,
        };
    }
    async verifyWallet(dto) {
        const { address, signature, nonce } = dto;
        const normalizedAddress = address.toLowerCase();
        const user = await this.prisma.user.findUnique({
            where: { walletAddress: normalizedAddress },
        });
        if (!user) {
            throw new common_1.NotFoundException('No nonce found for this address. Please request a nonce first.');
        }
        if (user.walletNonce !== nonce) {
            throw new common_1.UnauthorizedException('Invalid nonce');
        }
        if (!user.walletNonceExpiresAt || user.walletNonceExpiresAt < new Date()) {
            throw new common_1.UnauthorizedException('Nonce has expired. Please request a new one.');
        }
        const isValidSignature = await this.walletVerification.verifySignature(address, signature, nonce);
        if (!isValidSignature) {
            throw new common_1.UnauthorizedException('Invalid signature');
        }
        await this.prisma.user.update({
            where: { id: user.id },
            data: {
                walletNonce: null,
                walletNonceExpiresAt: null,
            },
        });
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
    generateToken(userId, email, role) {
        const payload = {
            sub: userId,
            email,
            role,
        };
        return this.jwtService.sign(payload);
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        jwt_1.JwtService,
        prisma_service_1.PrismaService,
        wallet_verification_service_1.WalletVerificationService])
], AuthService);
//# sourceMappingURL=auth.service.js.map