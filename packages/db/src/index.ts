import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

export function createDb(connectionString: string) {
  const pool = new Pool({ connectionString });
  return { db: drizzle(pool), pool };
}

export * from "./schema";

export { and, asc, eq, inArray } from "drizzle-orm";
