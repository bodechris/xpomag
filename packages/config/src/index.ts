import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().min(1).optional(),
  REDIS_URL: z.string().min(1).default("redis://localhost:6380"),
  SUPERADMIN_EMAILS: z.string().default("")
});

export function readEnv(input: NodeJS.ProcessEnv = process.env) {
  return envSchema.parse(input);
}

export function superadminEmails(input: NodeJS.ProcessEnv = process.env) {
  return new Set(
    readEnv(input).SUPERADMIN_EMAILS.split(",")
      .map((value) => value.trim().toLowerCase())
      .filter(Boolean)
  );
}
