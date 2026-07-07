# screenshotty-js

Official JavaScript / TypeScript client for the **[Screenshotty](https://screenshotty.link)** screenshot API — capture pixel-perfect screenshots and PDFs of any website or raw HTML with a single call.

[![CI](https://github.com/nihey/screenshotty-js/actions/workflows/ci.yml/badge.svg)](https://github.com/nihey/screenshotty-js/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/screenshotty-js.svg)](https://www.npmjs.com/package/screenshotty-js)
[![license](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)

- 📸 Full-page, element, mobile, and PDF capture
- 🌗 Dark mode, ad-blocking, cookie-banner removal, geo-targeting
- 🧩 Zero runtime dependencies — uses the native `fetch` (Node 18+, Deno, Bun, browsers)
- 🔒 Fully typed options and results

> Powered by the [Screenshotty screenshot API](https://screenshotty.link). Grab a free API key (1,500 screenshots/month, no card) in the [dashboard](https://screenshotty.link) and read the full [API documentation](https://screenshotty.link/docs).

## Install

```bash
npm install screenshotty-js
```

## Quick start

```ts
import { Screenshotty } from "screenshotty-js";

const client = new Screenshotty(process.env.SCREENSHOTTY_API_KEY!);

// Get raw PNG bytes
const png = await client.capture({ url: "https://example.com", fullPage: true });

// …or just the hosted URL
const url = await client.captureToUrl({ url: "https://example.com" });

// …or write straight to disk (Node.js)
await client.captureToFile({ url: "https://example.com" }, "example.png");
```

## Examples

**Mobile screenshot in dark mode:**

```ts
await client.capture({
  url: "https://example.com",
  viewportPreset: "iphone_15_pro_max",
  lightMode: "dark",
});
```

**Website → PDF:**

```ts
const pdf = await client.capture({
  url: "https://example.com",
  format: "application/pdf",
  printed: true,
});
```

**Capture a single element, clean of ads and cookie banners:**

```ts
await client.capture({
  url: "https://news.example.com/article",
  selector: "article",
  adblock: true,
  blockCookieBanner: true,
});
```

**Render raw HTML (great for OG images):**

```ts
await client.capture({
  html: "<h1 style='font:700 64px sans-serif'>Hello 👋</h1>",
  viewportWidth: 1200,
  viewportHeight: 630,
});
```

**Geo-targeted capture:**

```ts
const countries = await client.countries(); // e.g. ["us", "de", "br", …]
await client.capture({ url: "https://example.com", country: "de" });
```

## API

### `new Screenshotty(apiKey, options?)`

| Option | Type | Default |
|--------|------|---------|
| `baseUrl` | `string` | `https://api.screenshotty.link` |
| `fetch` | `typeof fetch` | global `fetch` |

### Methods

| Method | Returns | Notes |
|--------|---------|-------|
| `capture(options)` | `Promise<Uint8Array>` | Raw image/PDF bytes |
| `captureToJson(options)` | `Promise<ScreenshotResult>` | `{ url, width, height, mime }` |
| `captureToUrl(options)` | `Promise<string>` | Hosted screenshot URL |
| `captureToFile(options, path)` | `Promise<void>` | Node.js only |
| `countries()` | `Promise<string[]>` | Geo-targeting country codes |

### `ScreenshotOptions`

camelCase options are mapped to the API's parameters automatically. See the full,
always-current parameter reference in the [Screenshotty API docs](https://screenshotty.link/docs). Highlights: `url` / `html`,
`format`, `fullPage`, `selector`, `viewportWidth` / `viewportHeight` /
`viewportPreset`, `deviceScaleFactor`, `crop*`, `lightMode`, `adblock`,
`blockCookieBanner`, `country`, `javascriptCode` / `cssCode`, `httpHeaders` /
`cookies`, `readyEvent` / `waitMs`, `webhookUrl`.

### Errors

Non-2xx responses throw a `ScreenshottyError` with `.status` and `.body`:

```ts
import { ScreenshottyError } from "screenshotty-js";

try {
  await client.capture({ url: "https://example.com" });
} catch (err) {
  if (err instanceof ScreenshottyError) {
    console.error(err.status, err.message, err.body);
  }
}
```

## Development

```bash
npm install
npm run typecheck
npm test        # node --test with a mocked fetch
npm run build
```

## Links

- 🌐 [Screenshotty](https://screenshotty.link) — the screenshot API
- 📖 [API documentation](https://screenshotty.link/docs)
- 🧪 [Interactive playground](https://screenshotty.link/screenshot-api)
- 🐦 [@screenshotty](https://x.com/screenshotty)

## License

[MIT](./LICENSE) © Nihey Takizawa
