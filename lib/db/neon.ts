import 'server-only';
import { Pool, type QueryResultRow } from 'pg';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.warn('[ConversAI] DATABASE_URL not set — database features disabled in preview mode.');
}

const globalForNeon = globalThis as unknown as { neonPool?: Pool };

export const neonPool: Pool = connectionString
  ? (globalForNeon.neonPool ??
      (() => {
        const pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false }, max: 5 });
        if (process.env.NODE_ENV !== 'production') globalForNeon.neonPool = pool;
        return pool;
      })())
  : (null as unknown as Pool);

export async function queryNeon<T extends QueryResultRow>(
  text: string,
  params: unknown[] = []
): Promise<T[]> {
  if (!neonPool) return [];
  const result = await neonPool.query<T>(text, params);
  return result.rows;
}
