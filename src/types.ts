/**
 * Output formats supported by the Screenshotty API.
 * @see https://screenshotty.link/docs
 */
export type ImageFormat =
  | "image/png"
  | "image/jpg"
  | "image/jpeg"
  | "image/gif"
  | "image/webp"
  | "image/jp2"
  | "image/tiff"
  | "application/pdf";

/** How the API should return the result. High-level client methods set this for you. */
export type ResponseType = "image" | "json" | "url" | "redirect" | "file";

/** Page-lifecycle event to wait for before capturing. */
export type ReadyEvent =
  | "load"
  | "domcontentloaded"
  | "networkidle"
  | "networkidle2"
  | "networkidle0";

/** Force the page's color scheme. */
export type LightMode = "default" | "light" | "dark";

/** Named device/viewport presets. */
export type ViewportPreset =
  | "desktop"
  | "desktop_hd"
  | "desktop_4k"
  | "tablet"
  | "tablet_landscape"
  | "mobile"
  | "mobile_landscape"
  | "mobile_android"
  | "mobile_android_landscape"
  | "iphone_se"
  | "iphone_14"
  | "iphone_14_pro"
  | "iphone_14_pro_max"
  | "iphone_15"
  | "iphone_15_pro_max";

/** HTTP method used to deliver the webhook callback. */
export type WebhookMethod = "GET" | "POST" | "PUT" | "PATCH";

/** A cookie to set before loading the page (used for capturing authenticated pages). */
export interface Cookie {
  name: string;
  value: string;
  domain?: string;
  path?: string;
  [key: string]: unknown;
}

/**
 * Options for a screenshot request. All keys are camelCase and mapped to the
 * API's snake_case parameters automatically. Provide either `url` or `html`.
 */
export interface ScreenshotOptions {
  /** URL of the page to capture. Mutually exclusive with `html`. */
  url?: string;
  /** Raw HTML to render and capture. Mutually exclusive with `url`. */
  html?: string;
  /** Output format. Default: `image/png`. */
  format?: ImageFormat;

  /** Viewport width in px. Default: 1920. */
  viewportWidth?: number;
  /** Viewport height in px. Default: 1080. */
  viewportHeight?: number;
  /** Named viewport/device preset (overrides width/height). */
  viewportPreset?: ViewportPreset;
  /** Device pixel ratio. Default: 1. */
  deviceScaleFactor?: number;

  /** Crop origin X (px). */
  cropX?: number;
  /** Crop origin Y (px). */
  cropY?: number;
  /** Crop width (px). */
  cropWidth?: number;
  /** Crop height (px). */
  cropHeight?: number;

  /** Capture a single element by CSS selector instead of the page. */
  selector?: string;
  /** Capture the full scrollable page. Default: true. */
  fullPage?: boolean;
  /** Transparent background (PNG/WebP). Default: false. */
  transparentBackground?: boolean;
  /** Scroll to the bottom before capture (triggers lazy loading). Default: false. */
  scrollToBottom?: boolean;
  /** Use print CSS/media. Default: false. */
  printed?: boolean;

  /** Lifecycle event to wait for. Default: `domcontentloaded`. */
  readyEvent?: ReadyEvent;
  /** Extra fixed wait in ms after the ready event. */
  waitMs?: number;

  /** JavaScript to inject and run before capture. */
  javascriptCode?: string;
  /** CSS to inject before capture. */
  cssCode?: string;

  /** Override the User-Agent header. */
  userAgent?: string;
  /** Locale/language (e.g. `en-US`). Default: `en-US`. */
  language?: string;
  /** Cookies to set before loading (capture authed pages). */
  cookies?: Cookie[];
  /** Extra HTTP request headers. */
  httpHeaders?: Record<string, string>;

  /** Block ads. Default: false. */
  adblock?: boolean;
  /** Auto-dismiss cookie-consent banners. Default: false. */
  blockCookieBanner?: boolean;
  /** Force color scheme. Default: `default`. */
  lightMode?: LightMode;
  /** Route the request through a proxy in this country (ISO code). */
  country?: string;

  /** Webhook URL to call when the screenshot is ready. */
  webhookUrl?: string;
  /** Webhook HTTP method. Default: `POST`. */
  webhookMethod?: WebhookMethod;
  /** Extra headers to send with the webhook call. */
  webhookHeaders?: Record<string, string>;
}

/** Result returned by `captureToJson` / `captureToUrl` (`response_type=json|url`). */
export interface ScreenshotResult {
  /** Public URL of the stored screenshot. */
  url: string;
  /** Rendered width in px, when available. */
  width?: number;
  /** Rendered height in px, when available. */
  height?: number;
  /** MIME type of the stored file, when available. */
  mime?: string;
  /** Extracted HTML, when requested. */
  html?: string;
}
