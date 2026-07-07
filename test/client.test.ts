import { test } from "node:test";
import assert from "node:assert/strict";
import { Screenshotty, ScreenshottyError } from "../src/index.js";

/** Build a fake fetch that records the last call and returns a canned response. */
function fakeFetch(response: Response) {
  const calls: { url: string; init: RequestInit }[] = [];
  const impl = (async (url: string | URL, init: RequestInit = {}) => {
    calls.push({ url: String(url), init });
    return response;
  }) as unknown as typeof fetch;
  return { impl, calls };
}

test("throws without an API key", () => {
  assert.throws(() => new Screenshotty(""), /API key is required/);
});

test("capture() posts to the screenshot endpoint with the api key header", async () => {
  const bytes = new Uint8Array([1, 2, 3, 4]);
  const { impl, calls } = fakeFetch(new Response(bytes, { status: 200 }));
  const client = new Screenshotty("sk_test", { fetch: impl });

  const result = await client.capture({ url: "https://example.com" });

  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, "https://api.screenshotty.link/api/v1/screenshot");
  assert.equal(calls[0].init.method, "POST");
  const headers = calls[0].init.headers as Record<string, string>;
  assert.equal(headers["x-api-key"], "sk_test");
  assert.deepEqual(Array.from(result), [1, 2, 3, 4]);
});

test("maps camelCase options to snake_case body and sets response_type", async () => {
  const { impl, calls } = fakeFetch(new Response(new Uint8Array(), { status: 200 }));
  const client = new Screenshotty("sk_test", { fetch: impl });

  await client.capture({
    url: "https://example.com",
    viewportWidth: 800,
    fullPage: false,
    blockCookieBanner: true,
    deviceScaleFactor: 2,
  });

  const body = JSON.parse(calls[0].init.body as string);
  assert.deepEqual(body, {
    url: "https://example.com",
    viewport_width: 800,
    full_page: false,
    block_cookie_banner: true,
    device_scale_factor: 2,
    response_type: "image",
  });
});

test("captureToUrl() returns the url from the JSON response", async () => {
  const json = { url: "https://cdn.example/shot.png", width: 800, height: 600 };
  const { impl, calls } = fakeFetch(Response.json(json, { status: 200 }));
  const client = new Screenshotty("sk_test", { fetch: impl });

  const url = await client.captureToUrl({ url: "https://example.com" });

  assert.equal(url, "https://cdn.example/shot.png");
  assert.equal(JSON.parse(calls[0].init.body as string).response_type, "json");
});

test("countries() unwraps the countries array", async () => {
  const { impl, calls } = fakeFetch(Response.json({ countries: ["us", "de", "br"] }));
  const client = new Screenshotty("sk_test", { fetch: impl });

  const countries = await client.countries();

  assert.deepEqual(countries, ["us", "de", "br"]);
  assert.equal(calls[0].url, "https://api.screenshotty.link/api/v1/screenshot/countries");
  assert.equal(calls[0].init.method, "GET");
});

test("throws ScreenshottyError with status and parsed body on failure", async () => {
  const { impl } = fakeFetch(Response.json({ error: "Invalid API key" }, { status: 401 }));
  const client = new Screenshotty("sk_bad", { fetch: impl });

  await assert.rejects(client.capture({ url: "https://example.com" }), (err: unknown) => {
    assert.ok(err instanceof ScreenshottyError);
    assert.equal(err.status, 401);
    assert.equal(err.message, "Invalid API key");
    assert.deepEqual(err.body, { error: "Invalid API key" });
    return true;
  });
});

test("respects a custom baseUrl", async () => {
  const { impl, calls } = fakeFetch(new Response(new Uint8Array(), { status: 200 }));
  const client = new Screenshotty("sk_test", {
    fetch: impl,
    baseUrl: "https://api.example.test/",
  });

  await client.capture({ url: "https://example.com" });

  assert.equal(calls[0].url, "https://api.example.test/api/v1/screenshot");
});
