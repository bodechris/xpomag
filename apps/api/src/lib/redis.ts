import { Redis } from "ioredis";
import { readEnv } from "@xpomag/config";

let redis: Redis | undefined;

export function getRedis() {
  redis ??= new Redis(readEnv().REDIS_URL, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false
  });
  return redis;
}
