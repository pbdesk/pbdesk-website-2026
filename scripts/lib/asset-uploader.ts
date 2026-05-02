// Idempotent asset uploads keyed by SHA-1 of file content. The first run
// uploads each unique image and writes a `.cache.json` file under
// `.storyblok-assets/` so subsequent runs skip the network for files
// whose content hasn't changed.

import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import type { StoryblokManagement } from "./storyblok-management";

interface CacheEntry {
  asset_id: number;
  filename: string;
  hash: string;
}

interface CacheFile {
  entries: Record<string, CacheEntry>; // keyed by absolute file path
  version: 1;
}

const CACHE_PATH = resolve(process.cwd(), ".storyblok-assets/cache.json");

function loadCache(): CacheFile {
  if (!existsSync(CACHE_PATH)) {
    return { version: 1, entries: {} };
  }
  try {
    const raw = readFileSync(CACHE_PATH, "utf8");
    return JSON.parse(raw) as CacheFile;
  } catch {
    return { version: 1, entries: {} };
  }
}

function saveCache(cache: CacheFile): void {
  mkdirSync(dirname(CACHE_PATH), { recursive: true });
  writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2));
}

function hashFile(filePath: string): string {
  const buf = readFileSync(filePath);
  return createHash("sha1").update(buf).digest("hex");
}

export interface UploadedAsset {
  filename: string;
  fromCache: boolean;
  id: number;
}

export class AssetUploader {
  private readonly sb: StoryblokManagement;

  private readonly cache: CacheFile;

  constructor(sb: StoryblokManagement) {
    this.sb = sb;
    this.cache = loadCache();
  }

  async upload(absolutePath: string): Promise<UploadedAsset> {
    const hash = hashFile(absolutePath);
    const cached = this.cache.entries[absolutePath];
    if (cached && cached.hash === hash) {
      return {
        id: cached.asset_id,
        filename: cached.filename,
        fromCache: true,
      };
    }

    const record = await this.sb.uploadAsset(absolutePath);
    const filename = record.pretty_url ?? record.filename;
    this.cache.entries[absolutePath] = {
      hash,
      asset_id: record.id,
      filename,
    };
    saveCache(this.cache);
    return {
      id: record.id,
      filename,
      fromCache: false,
    };
  }

  size(): number {
    return Object.keys(this.cache.entries).length;
  }
}
