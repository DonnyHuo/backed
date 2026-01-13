import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

// AWS IAM Auth imports (only used in Vercel)
let awsCredentialsProvider: any;
let attachDatabasePool: any;
let Signer: any;

// Check if we're in Vercel environment
const isVercelEnv = process.env.AWS_ROLE_ARN && process.env.PGHOST;

if (isVercelEnv) {
  // Dynamic imports for Vercel-specific modules
  try {
    awsCredentialsProvider = require('@vercel/functions/oidc').awsCredentialsProvider;
    attachDatabasePool = require('@vercel/functions').attachDatabasePool;
    Signer = require('@aws-sdk/rds-signer').Signer;
  } catch (e) {
    console.warn('Vercel AWS modules not available:', e);
  }
}

function createAwsPool(): Pool {
  const signer = new Signer({
    hostname: process.env.PGHOST,
    port: Number(process.env.PGPORT || 5432),
    username: process.env.PGUSER,
    region: process.env.AWS_REGION,
    credentials: awsCredentialsProvider({
      roleArn: process.env.AWS_ROLE_ARN,
      clientConfig: { region: process.env.AWS_REGION },
    }),
  });

  const pool = new Pool({
    host: process.env.PGHOST,
    user: process.env.PGUSER,
    database: process.env.PGDATABASE || 'postgres',
    password: () => signer.getAuthToken(),
    port: Number(process.env.PGPORT || 5432),
    ssl: { rejectUnauthorized: false },
    max: 20,
  });

  // Attach pool for Vercel connection management
  if (attachDatabasePool) {
    attachDatabasePool(pool);
  }

  return pool;
}

function createPrismaClient() {
  if (isVercelEnv && awsCredentialsProvider && Signer) {
    // AWS Aurora with IAM Authentication (Vercel)
    const pool = createAwsPool();
    const adapter = new PrismaPg(pool);
    return { client: new PrismaClient({ adapter } as any), pool };
  } else {
    // Standard connection (local development)
    return {
      client: new PrismaClient({
        log:
          process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
      }),
      pool: null,
    };
  }
}

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private prisma: PrismaClient;
  private pool: Pool | null;

  constructor() {
    const { client, pool } = createPrismaClient();
    this.prisma = client;
    this.pool = pool;
  }

  // Proxy PrismaClient properties
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

  // Clean database utility (for testing)
  async cleanDatabase() {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Cannot clean database in production');
    }
    await this.prisma.post.deleteMany();
    await this.prisma.user.deleteMany();
  }
}
