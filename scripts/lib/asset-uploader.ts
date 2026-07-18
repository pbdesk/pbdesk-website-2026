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
    return { entries: {}, version: 1 };
  }
  try {
    const raw = readFileSync(CACHE_PATH, "utf8");
    return JSON.parse(raw) as CacheFile;
  } catch {
    return { entries: {}, version: 1 };
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

  async upload(
    absolutePath: string,
    assetFolderId: number | null = null
  ): Promise<UploadedAsset> {
    const hash = hashFile(absolutePath);
    // Namespace the cache key by folder so a file previously uploaded to the
    // root isn't served from cache when a folder is requested (and vice
    // versa). Root uploads keep the bare-path key for backward compatibility.
    const cacheKey =
      assetFolderId === null
        ? absolutePath
        : `${absolutePath}::folder-${assetFolderId}`;
    const cached = this.cache.entries[cacheKey];
    if (cached && cached.hash === hash) {
      return {
        filename: cached.filename,
        fromCache: true,
        id: cached.asset_id,
      };
    }

    const record = await this.sb.uploadAsset(absolutePath, assetFolderId);
    const filename = record.pretty_url ?? record.filename;
    this.cache.entries[cacheKey] = {
      asset_id: record.id,
      filename,
      hash,
    };
    saveCache(this.cache);
    return {
      filename,
      fromCache: false,
      id: record.id,
    };
  }

  size(): number {
    return Object.keys(this.cache.entries).length;
  }
}
