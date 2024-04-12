import 'dotenv/config'
import type { Config } from 'drizzle-kit';

export default {
  schema: './src/db/schema.ts',
  out: './drizzle',
  driver: 'pg',
  dbCredentials: {
    host: 'localhost.vdi',
    user: 'test',
    password: 'test',
    database: 'test',
  }
} satisfies Config
