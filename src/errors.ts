/** Error thrown when the Screenshotty API responds with a non-2xx status. */
export class ScreenshottyError extends Error {
  /** HTTP status code of the failed response. */
  readonly status: number;
  /** Parsed JSON body if available, otherwise the raw response text. */
  readonly body: unknown;

  constructor(message: string, status: number, body: unknown) {
    super(message);
    this.name = "ScreenshottyError";
    this.status = status;
    this.body = body;
    // Restore prototype chain for instanceof across transpile targets.
    Object.setPrototypeOf(this, ScreenshottyError.prototype);
  }
}
