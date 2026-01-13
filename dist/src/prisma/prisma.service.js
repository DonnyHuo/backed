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
exports.PrismaService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const adapter_pg_1 = require("@prisma/adapter-pg");
const pg_1 = require("pg");
const rds_signer_1 = require("@aws-sdk/rds-signer");
function createPrismaClient() {
    const isAwsIamAuth = process.env.AWS_ROLE_ARN && process.env.PGHOST;
    if (isAwsIamAuth) {
        const signer = new rds_signer_1.Signer({
            hostname: process.env.PGHOST,
            port: Number(process.env.PGPORT || 5432),
            username: process.env.PGUSER,
            region: process.env.AWS_REGION,
        });
        if (process.env.VERCEL_OIDC_TOKEN) {
            const { awsCredentialsProvider } = require('@vercel/oidc-aws-credentials-provider');
            signer.credentials = awsCredentialsProvider({
                roleArn: process.env.AWS_ROLE_ARN,
                clientConfig: { region: process.env.AWS_REGION },
            });
        }
        const pool = new pg_1.Pool({
            host: process.env.PGHOST,
            user: process.env.PGUSER,
            database: process.env.PGDATABASE || 'postgres',
            port: Number(process.env.PGPORT || 5432),
            ssl: { rejectUnauthorized: false },
            password: () => signer.getAuthToken(),
        });
        const adapter = new adapter_pg_1.PrismaPg(pool);
        return { client: new client_1.PrismaClient({ adapter }), pool };
    }
    else {
        return {
            client: new client_1.PrismaClient({
                log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
            }),
            pool: null,
        };
    }
}
let PrismaService = class PrismaService {
    constructor() {
        const { client, pool } = createPrismaClient();
        this.prisma = client;
        this.pool = pool;
    }
    get user() {
        return this.prisma.user;
    }
    get post() {
        return this.prisma.post;
    }
    get $connect() {
        return this.prisma.$connect.bind(this.prisma);
    }
    get $disconnect() {
        return this.prisma.$disconnect.bind(this.prisma);
    }
    get $transaction() {
        return this.prisma.$transaction.bind(this.prisma);
    }
    async onModuleInit() {
        await this.prisma.$connect();
    }
    async onModuleDestroy() {
        await this.prisma.$disconnect();
        if (this.pool) {
            await this.pool.end();
        }
    }
    async cleanDatabase() {
        if (process.env.NODE_ENV === 'production') {
            throw new Error('Cannot clean database in production');
        }
        await this.prisma.post.deleteMany();
        await this.prisma.user.deleteMany();
    }
};
exports.PrismaService = PrismaService;
exports.PrismaService = PrismaService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], PrismaService);
//# sourceMappingURL=prisma.service.js.map