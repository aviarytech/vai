import { describe, expect, it, beforeAll, afterAll } from "bun:test";
import { Elysia } from "elysia";
import { CONFIG } from "./config";

describe("Verifiable AI MVP Backend", () => {
  let app: Elysia;

  beforeAll(() => {
    // Import the app dynamically to avoid starting the server immediately
    app = require("./index").app;
  });

  afterAll(() => {
    // Close the server after all tests
    app.stop();
  });

  it("should respond with 'Hello, AI Credential Verifier!' on GET /", async () => {
    const response = await app.handle(
      new Request(`http://localhost:${CONFIG.PORT}/`)
    );
    expect(response.status).toBe(200);
    expect(await response.text()).toBe("Hello, AI Credential Verifier!");
  });

  it("should have CORS enabled", async () => {
    const response = await app.handle(
      new Request(`http://localhost:${CONFIG.PORT}/`, {
        method: "OPTIONS",
      })
    );
    expect(response.headers.get("Access-Control-Allow-Origin")).toBe("*");
  });
});
