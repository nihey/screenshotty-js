import { ScreenshottyError } from "./errors.js";
import type { ScreenshotOptions, ScreenshotResult } from "./types.js";

const DEFAULT_BASE_URL = "https://api.screenshotty.link";
const SCREENSHOT_PATH = "/api/v1/screenshot";
const COUNTRIES_PATH = "/api/v1/screenshot/countries";

/** Configuration for a {@link Screenshotty} client. */
export interface ScreenshottyClientOptions {
  /** Override the API base URL. Default: `https://api.screenshotty.link`. */
  baseUrl?: string;
  /** Custom fetch implementation (defaults to the global `fetch`). */
  fetch?: typeof fetch;
}

type InternalOptions = ScreenshotOptions & { responseType: "image" | "json" };

/** camelCase → snake_case (e.g. `viewportWidth` → `viewport_width`). */
function toSnakeCase(key: string): string {
  return key.replace(/[A-Z]/g, (m) => `_${m.toLowerCase()}`);
}

function toRequestBody(options: InternalOptions): Record<string, unknown> {
  const body: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(options)) {
    if (value === undefined) continue;
    body[toSnakeCase(key)] = value;
  }
  return body;
}

function extractMessage(body: unknown): string | undefined {
  if (body && typeof body === "object") {
    const record = body as Record<string, unknown>;
    if (typeof record.error === "string") return record.error;
    if (typeof record.message === "string") return record.message;
  }
  return undefined;
}

/**
 * Client for the Screenshotty screenshot API.
 *
 * @example
 * ```ts
 * const client = new Screenshotty(process.env.SCREENSHOTTY_API_KEY!);
 * const png = await client.capture({ url: "https://example.com", fullPage: true });
 * ```
 *
 * @see https://screenshotty.link/docs
 */
export class Screenshotty {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly fetchImpl: typeof fetch;

  constructor(apiKey: string, options: ScreenshottyClientOptions = {}) {
    if (!apiKey) {
      throw new Error(
        "Screenshotty: an API key is required. Get one at https://screenshotty.link.",
      );
    }
    this.apiKey = apiKey;
    this.baseUrl = (options.baseUrl ?? DEFAULT_BASE_URL).replace(/\/+$/, "");
    const fetchImpl = options.fetch ?? globalThis.fetch;
    if (typeof fetchImpl !== "function") {
      throw new Error(
        "Screenshotty: no fetch implementation found. Use Node 18+ or pass `options.fetch`.",
      );
    }
    this.fetchImpl = fetchImpl;
  }

  /** Capture a screenshot and return the raw image (or PDF) bytes. */
  async capture(options: ScreenshotOptions): Promise<Uint8Array> {
    const res = await this.request({ ...options, responseType: "image" });
    return new Uint8Array(await res.arrayBuffer());
  }

  /** Capture and return the result metadata (`{ url, width, height, mime }`). */
  async captureToJson(options: ScreenshotOptions): Promise<ScreenshotResult> {
    const res = await this.request({ ...options, responseType: "json" });
    return (await res.json()) as ScreenshotResult;
  }

  /** Capture and return just the stored screenshot URL. */
  async captureToUrl(options: ScreenshotOptions): Promise<string> {
    const result = await this.captureToJson(options);
    return result.url;
  }

  /**
   * Capture and write the bytes to a file. Node.js only.
   * @param filePath Destination path.
   */
  async captureToFile(options: ScreenshotOptions, filePath: string): Promise<void> {
    const bytes = await this.capture(options);
    const { writeFile } = await import("node:fs/promises");
    await writeFile(filePath, bytes);
  }

  /** List the country codes available for geo-targeted captures. */
  async countries(): Promise<string[]> {
    const res = await this.rawFetch(COUNTRIES_PATH, { method: "GET" });
    const data = (await res.json()) as { countries?: string[] };
    return data.countries ?? [];
  }

  private request(options: InternalOptions): Promise<Response> {
    return this.rawFetch(SCREENSHOT_PATH, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(toRequestBody(options)),
    });
  }

  private async rawFetch(path: string, init: RequestInit): Promise<Response> {
    const res = await this.fetchImpl(`${this.baseUrl}${path}`, {
      ...init,
      headers: { "x-api-key": this.apiKey, ...(init.headers ?? {}) },
    });

    if (!res.ok) {
      const text = await res.text();
      let body: unknown = text;
      try {
        body = JSON.parse(text);
      } catch {
        /* keep raw text */
      }
      const message =
        extractMessage(body) ?? `Screenshotty request failed with status ${res.status}.`;
      throw new ScreenshottyError(message, res.status, body);
    }

    return res;
  }
}
