import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { Signer } from '@aws-sdk/rds-signer';

function createPrismaClient() {
  // Check if we're using AWS IAM auth (Vercel deployment)
  const isAwsIamAuth = process.env.AWS_ROLE_ARN && process.env.PGHOST;

  if (isAwsIamAuth) {
    // AWS Aurora with IAM Authentication
    const signer = new Signer({
      hostname: process.env.PGHOST!,
      port: Number(process.env.PGPORT || 5432),
      username: process.env.PGUSER!,
      region: process.env.AWS_REGION!,
    });

    // For Vercel, use OIDC credentials
    if (process.env.VERCEL_OIDC_TOKEN) {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { awsCredentialsProvider } = require('@vercel/oidc-aws-credentials-provider');
      (signer as any).credentials = awsCredentialsProvider({
        roleArn: process.env.AWS_ROLE_ARN!,
        clientConfig: { region: process.env.AWS_REGION! },
      });
    }

    const pool = new Pool({
      host: process.env.PGHOST,
      user: process.env.PGUSER,
      database: process.env.PGDATABASE || 'postgres',
      port: Number(process.env.PGPORT || 5432),
      ssl: { rejectUnauthorized: false },
      password: () => signer.getAuthToken(),
    });

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

  // Proxy all PrismaClient properties
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
