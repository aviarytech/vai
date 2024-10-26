import { describe, expect, it, beforeAll, afterAll, jest } from "bun:test";
import { Elysia } from "elysia";
import { CONFIG } from "./config";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";

describe("Verifiable AI MVP Backend", () => {
  let app: Elysia;
  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    // Set up in-memory MongoDB server
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);

    // Import the app dynamically to avoid starting the server immediately
    app = require("./index").app;
  });

  afterAll(async () => {
    // Close the server and database connections after all tests
    app.stop();
    await mongoose.disconnect();
    await mongoServer.stop();
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

  // Add more tests for other routes as they are implemented
});
