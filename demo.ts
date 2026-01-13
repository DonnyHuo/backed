import { Pool } from 'pg';

const pool = new Pool({
  connectionString:
    'postgresql://neondb_owner:npg_ZvN5loF2IcCJ@ep-mute-hall-a1vapqdy-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  ssl: {
    rejectUnauthorized: false,
  },
});

const client = await pool.connect();

const res = await client.query('SELECT id FROM playing_with_neon ORDER BY id ASC');
console.log(res);

await client.release();
