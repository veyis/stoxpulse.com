import { readFile, writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { dataConfig } from "./config";

const CACHE_DIR = path.join(process.cwd(), dataConfig.cache.dir);

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

async function ensureCacheDir(subdir?: string): Promise<void> {
  const dir = subdir ? path.join(CACHE_DIR, subdir) : CACHE_DIR;
  if (!existsSync(dir)) {
    await mkdir(dir, { recursive: true });
  }
}

function getCachePath(key: string): string {
  // Sanitize key for filesystem
  const sanitized = key.replace(/[^a-zA-Z0-9_-]/g, "_");
  return path.join(CACHE_DIR, `${sanitized}.json`);
}

export async function getCached<T>(key: string): Promise<T | null> {
  const filePath = getCachePath(key);
  try {
    if (!existsSync(filePath)) return null;
    const raw = await readFile(filePath, "utf-8");
    const entry: CacheEntry<T> = JSON.parse(raw);
    const age = (Date.now() - entry.timestamp) / 1000;
    if (age > entry.ttl) return null; // expired
    return entry.data;
  } catch {
    return null;
  }
}

export async function setCache<T>(key: string, data: T, ttlSeconds: number): Promise<void> {
  try {
    await ensureCacheDir();
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttlSeconds,
    };
    const filePath = getCachePath(key);
    await writeFile(filePath, JSON.stringify(entry), "utf-8");
  } catch {
    // Silently ignore — filesystem may be read-only (e.g. Vercel serverless)
  }
}

export async function invalidateCache(key: string): Promise<void> {
  const filePath = getCachePath(key);
  try {
    if (existsSync(filePath)) {
      const { unlink } = await import("fs/promises");
      await unlink(filePath);
    }
  } catch {
    // ignore
  }
}
