"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.query = query;
exports.withConnection = withConnection;
const oidc_1 = require("@vercel/functions/oidc");
const functions_1 = require("@vercel/functions");
const rds_signer_1 = require("@aws-sdk/rds-signer");
const pg_1 = require("pg");
const signer = new rds_signer_1.Signer({
    hostname: process.env.PGHOST,
    port: Number(process.env.PGPORT),
    username: process.env.PGUSER,
    region: process.env.AWS_REGION,
    credentials: (0, oidc_1.awsCredentialsProvider)({
        roleArn: process.env.AWS_ROLE_ARN,
        clientConfig: { region: process.env.AWS_REGION },
    }),
});
const pool = new pg_1.Pool({
    host: process.env.PGHOST,
    user: process.env.PGUSER,
    database: process.env.PGDATABASE || 'postgres',
    password: () => signer.getAuthToken(),
    port: Number(process.env.PGPORT),
    ssl: { rejectUnauthorized: false },
    max: 20,
});
(0, functions_1.attachDatabasePool)(pool);
async function query(sql, args) {
    return pool.query(sql, args);
}
async function withConnection(fn) {
    const client = await pool.connect();
    try {
        return await fn(client);
    }
    finally {
        client.release();
    }
}
//# sourceMappingURL=prisma.service.js.map