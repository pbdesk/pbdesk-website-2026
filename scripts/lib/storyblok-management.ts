// Storyblok Management API client for seed + import scripts.
// Idempotent helpers that find-or-create components, datasources, stories, and assets.

import { createHash } from "node:crypto";
import { readFileSync, statSync } from "node:fs";
import { basename } from "node:path";

const API_BASE_BY_REGION: Record<string, string> = {
  eu: "https://mapi.storyblok.com",
  us: "https://api-us.storyblok.com",
};

interface RequestOptions {
  body?: unknown;
  method?: "GET" | "POST" | "PUT" | "DELETE";
  path: string;
  query?: Record<string, string | number | undefined>;
}

export interface SbComponentField {
  asset_folder_id?: number;
  asset_link_type?: boolean;
  component_whitelist?: string[];
  customize_toolbar?: boolean;
  datasource_slug?: string;
  default_value?: unknown;
  description?: string;
  display_name?: string;
  email_link_type?: boolean;
  exclude_empty_option?: boolean;
  filetypes?: string[];
  filter_content_type?: string[];
  maximum?: number;
  minimum?: number;
  options?: { name: string; value: string }[];
  pos?: number;
  required?: boolean;
  restrict_components?: boolean;
  rich_markdown?: boolean;
  rtl?: boolean;
  show_anchor?: boolean;
  source?: "internal" | "external" | "internal_languages" | "internal_stories";
  toolbar?: string[];
  translatable?: boolean;
  type: string;
  use_uuid?: boolean;
}

export interface SbComponent {
  color?: string;
  component_group_uuid?: string;
  display_name?: string;
  icon?: string;
  is_nestable?: boolean;
  is_root?: boolean;
  name: string;
  preview_field?: string;
  schema?: Record<string, SbComponentField>;
}

interface SbComponentRecord extends SbComponent {
  created_at: string;
  id: number;
  updated_at: string;
}

export interface SbDatasource {
  name: string;
  slug: string;
}

interface SbDatasourceRecord extends SbDatasource {
  id: number;
}

export interface SbDatasourceEntry {
  datasource_id?: number;
  name: string;
  value: string;
}

interface SbDatasourceEntryRecord extends SbDatasourceEntry {
  id: number;
}

export interface SbStoryContent {
  component: string;
  [key: string]: unknown;
}

export interface SbStoryInput {
  content?: SbStoryContent;
  default_root?: string;
  full_slug?: string;
  is_folder?: boolean;
  is_startpage?: boolean;
  name: string;
  parent_id?: number;
  // Storyblok "Real path" override. When set, the visual editor appends this
  // (instead of `full_slug`) to the preview URL. Use "/" for the home story
  // so the editor loads `/` rather than `/home`.
  path?: string;
  slug: string;
}

interface SbStoryRecord extends SbStoryInput {
  full_slug: string;
  id: number;
  published: boolean;
  uuid: string;
}

interface SbAssetRecord {
  asset_folder_id?: number;
  content_length: number;
  filename: string;
  id: number;
  // Storyblok returns a CDN URL on filename after upload finalizes
  pretty_url?: string;
}

interface AssetUploadSignedResponse {
  fields: Record<string, string>;
  filename: string;
  id: number;
  post_url: string;
  pretty_url: string;
}

export class StoryblokManagement {
  private readonly token: string;

  private readonly spaceId: string;

  private readonly apiBase: string;

  private readonly minRequestSpacingMs = 350; // ~3 req/s

  private lastRequestAt = 0;

  constructor(opts: { token: string; spaceId: string; region?: string }) {
    this.token = opts.token;
    this.spaceId = opts.spaceId;
    const region = opts.region ?? "eu";
    const base = API_BASE_BY_REGION[region];
    if (!base) {
      throw new Error(`Unknown Storyblok region: ${region}`);
    }
    this.apiBase = base;
  }

  private async throttle(): Promise<void> {
    const now = Date.now();
    const elapsed = now - this.lastRequestAt;
    if (elapsed < this.minRequestSpacingMs) {
      await new Promise<void>((resolve) =>
        setTimeout(resolve, this.minRequestSpacingMs - elapsed)
      );
    }
    this.lastRequestAt = Date.now();
  }

  private buildUrl(path: string, query?: RequestOptions["query"]): string {
    const url = new URL(`/v1/spaces/${this.spaceId}${path}`, this.apiBase);
    if (query) {
      for (const [key, value] of Object.entries(query)) {
        if (value !== undefined) {
          url.searchParams.set(key, String(value));
        }
      }
    }
    return url.toString();
  }

  private async request<T>(opts: RequestOptions): Promise<T> {
    await this.throttle();
    const url = this.buildUrl(opts.path, opts.query);
    const res = await fetch(url, {
      method: opts.method ?? "GET",
      headers: {
        Authorization: this.token,
        "Content-Type": "application/json",
      },
      body: opts.body === undefined ? undefined : JSON.stringify(opts.body),
    });
    if (res.status === 429) {
      // Backoff and retry once
      await new Promise<void>((resolve) => setTimeout(resolve, 1500));
      return this.request<T>(opts);
    }
    if (!res.ok) {
      const text = await res.text();
      throw new Error(
        `Storyblok ${opts.method ?? "GET"} ${opts.path} failed: ${res.status} ${text}`
      );
    }
    if (res.status === 204) {
      return undefined as T;
    }
    return (await res.json()) as T;
  }

  async listComponents(): Promise<SbComponentRecord[]> {
    const res = await this.request<{ components: SbComponentRecord[] }>({
      path: "/components",
      query: { per_page: 100 },
    });
    return res.components;
  }

  async upsertComponent(
    component: SbComponent
  ): Promise<{ record: SbComponentRecord; created: boolean }> {
    const all = await this.listComponents();
    const existing = all.find((c) => c.name === component.name);
    if (existing) {
      const updated = await this.request<{ component: SbComponentRecord }>({
        method: "PUT",
        path: `/components/${existing.id}`,
        body: { component: { ...component, id: existing.id } },
      });
      return { record: updated.component, created: false };
    }
    const created = await this.request<{ component: SbComponentRecord }>({
      method: "POST",
      path: "/components",
      body: { component },
    });
    return { record: created.component, created: true };
  }

  async listDatasources(): Promise<SbDatasourceRecord[]> {
    const res = await this.request<{ datasources: SbDatasourceRecord[] }>({
      path: "/datasources",
      query: { per_page: 100 },
    });
    return res.datasources;
  }

  async upsertDatasource(
    datasource: SbDatasource
  ): Promise<{ record: SbDatasourceRecord; created: boolean }> {
    const all = await this.listDatasources();
    const existing = all.find((d) => d.slug === datasource.slug);
    if (existing) {
      const updated = await this.request<{ datasource: SbDatasourceRecord }>({
        method: "PUT",
        path: `/datasources/${existing.id}`,
        body: { datasource: { ...datasource, id: existing.id } },
      });
      return { record: updated.datasource, created: false };
    }
    const created = await this.request<{ datasource: SbDatasourceRecord }>({
      method: "POST",
      path: "/datasources",
      body: { datasource },
    });
    return { record: created.datasource, created: true };
  }

  async listDatasourceEntries(
    datasourceId: number
  ): Promise<SbDatasourceEntryRecord[]> {
    const all: SbDatasourceEntryRecord[] = [];
    let page = 1;
    while (true) {
      const res = await this.request<{
        datasource_entries: SbDatasourceEntryRecord[];
      }>({
        path: "/datasource_entries",
        query: { datasource_id: datasourceId, per_page: 100, page },
      });
      all.push(...res.datasource_entries);
      if (res.datasource_entries.length < 100) {
        break;
      }
      page += 1;
    }
    return all;
  }

  async upsertDatasourceEntry(
    datasourceId: number,
    entry: SbDatasourceEntry
  ): Promise<{ record: SbDatasourceEntryRecord; created: boolean }> {
    const all = await this.listDatasourceEntries(datasourceId);
    const existing = all.find((e) => e.value === entry.value);
    if (existing) {
      // Update name only if changed
      if (existing.name !== entry.name) {
        const updated = await this.request<{
          datasource_entry: SbDatasourceEntryRecord;
        }>({
          method: "PUT",
          path: `/datasource_entries/${existing.id}`,
          body: {
            datasource_entry: { ...entry, datasource_id: datasourceId },
          },
        });
        return { record: updated.datasource_entry, created: false };
      }
      return { record: existing, created: false };
    }
    const created = await this.request<{
      datasource_entry: SbDatasourceEntryRecord;
    }>({
      method: "POST",
      path: "/datasource_entries",
      body: { datasource_entry: { ...entry, datasource_id: datasourceId } },
    });
    return { record: created.datasource_entry, created: true };
  }

  async findStoryBySlug(fullSlug: string): Promise<SbStoryRecord | null> {
    const res = await this.request<{ stories: SbStoryRecord[] }>({
      path: "/stories",
      query: { with_slug: fullSlug, per_page: 1 },
    });
    return res.stories[0] ?? null;
  }

  async getStory(id: number): Promise<SbStoryRecord> {
    const res = await this.request<{ story: SbStoryRecord }>({
      path: `/stories/${id}`,
    });
    return res.story;
  }

  async upsertStory(
    story: SbStoryInput
  ): Promise<{ record: SbStoryRecord; created: boolean }> {
    const fullSlug = story.full_slug ?? story.slug;
    const existing = await this.findStoryBySlug(fullSlug);
    if (existing) {
      const updated = await this.request<{ story: SbStoryRecord }>({
        method: "PUT",
        path: `/stories/${existing.id}`,
        body: { story: { ...existing, ...story, id: existing.id } },
      });
      return { record: updated.story, created: false };
    }
    const created = await this.request<{ story: SbStoryRecord }>({
      method: "POST",
      path: "/stories",
      body: { story, publish: 0 },
    });
    return { record: created.story, created: true };
  }

  async publishStory(id: number): Promise<void> {
    await this.request({
      method: "GET",
      path: `/stories/${id}/publish`,
    });
  }

  async findFolderByFullSlug(fullSlug: string): Promise<SbStoryRecord | null> {
    const found = await this.findStoryBySlug(fullSlug);
    if (found?.is_folder) {
      return found;
    }
    return null;
  }

  async upsertFolder(folder: {
    name: string;
    slug: string;
    parent_id?: number;
    default_root?: string;
  }): Promise<{ record: SbStoryRecord; created: boolean }> {
    const fullSlug = folder.slug; // top-level folders only in this script
    const existing = await this.findFolderByFullSlug(fullSlug);
    if (existing) {
      return { record: existing, created: false };
    }
    const created = await this.request<{ story: SbStoryRecord }>({
      method: "POST",
      path: "/stories",
      body: {
        story: {
          name: folder.name,
          slug: folder.slug,
          is_folder: true,
          parent_id: folder.parent_id,
          default_root: folder.default_root,
        },
      },
    });
    return { record: created.story, created: true };
  }

  async findAssetByFilename(filename: string): Promise<SbAssetRecord | null> {
    const res = await this.request<{ assets: SbAssetRecord[] }>({
      path: "/assets",
      query: { search: filename, per_page: 25 },
    });
    return res.assets.find((a) => a.filename.endsWith(`/${filename}`)) ?? null;
  }

  async uploadAsset(filePath: string): Promise<SbAssetRecord> {
    const filename = basename(filePath);
    const stat = statSync(filePath);
    const fileBuffer = readFileSync(filePath);

    // Step 1: ask Storyblok for a signed URL
    const signed = await this.request<AssetUploadSignedResponse>({
      method: "POST",
      path: "/assets",
      body: {
        filename,
        size: `${stat.size}`,
        content_length: stat.size,
        asset_folder_id: null,
      },
    });

    // Step 2: upload to S3 via the signed POST URL (multipart/form-data)
    const form = new FormData();
    for (const [field, value] of Object.entries(signed.fields)) {
      form.append(field, value);
    }
    const blob = new Blob([fileBuffer]);
    form.append("file", blob, filename);
    const uploadRes = await fetch(signed.post_url, {
      method: "POST",
      body: form,
    });
    if (!uploadRes.ok) {
      throw new Error(
        `Asset upload failed for ${filename}: ${uploadRes.status} ${await uploadRes.text()}`
      );
    }

    // Step 3: finalize on Storyblok side
    await this.request({
      method: "GET",
      path: `/assets/${signed.id}/finish_upload`,
    });

    return {
      id: signed.id,
      filename: signed.pretty_url,
      content_length: stat.size,
      pretty_url: signed.pretty_url,
    };
  }

  static contentHash(buffer: Buffer): string {
    return createHash("sha1").update(buffer).digest("hex");
  }
}
