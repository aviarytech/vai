import { describe, expect, it, beforeAll, afterAll } from "bun:test";
import { Elysia } from "elysia";
import { CONFIG } from "./config";
import { MongoMemoryServer } from "mongodb-memory-server";
import { connectToDatabase, disconnectFromDatabase } from "./db";

describe("Verifiable AI MVP Backend", () => {
  let mongoServer: MongoMemoryServer;
  let app: Elysia;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    CONFIG.MONGODB_URI = mongoUri;
    await connectToDatabase();
    
    // Import the app after database connection is established
    const { app: testApp } = await import("./index");
    app = testApp;
  });

  afterAll(async () => {
    await disconnectFromDatabase();
    await mongoServer.stop();
  });

  it("should respond with 'Hello, AI Credential Verifier!' on GET /", async () => {
    const response = await app.handle(
      new Request("http://localhost:3000/")
    );
    expect(response.status).toBe(200);
    expect(await response.text()).toBe("Hello, AI Credential Verifier!");
  });

  it("should have CORS enabled", async () => {
    const response = await app.handle(
      new Request(`http://localhost:${CONFIG.PORT}/`, {
        method: "OPTIONS",
        headers: {
          "Origin": "http://localhost:5173",
          "Access-Control-Request-Method": "GET",
          "Access-Control-Request-Headers": "Content-Type"
        }
      })
    );

    // Check CORS headers
    expect(response.headers.get("Access-Control-Allow-Origin")).toBe("http://localhost:5173");
    expect(response.headers.get("Access-Control-Allow-Methods")).toContain("GET");
    expect(response.headers.get("Access-Control-Allow-Headers")).toContain("Content-Type");
    expect(response.status).toBe(204); // Successful preflight response
  });

  it("should have verification endpoint", async () => {
    const response = await app.handle(
      new Request("http://localhost:3000/api/credentials/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Origin": "http://localhost:5173"
        },
        body: JSON.stringify({
          credentialSubject: {
            modelInfo: {
              name: "GPT-4",
              version: "1.0",
              provider: "OpenAI",
            },
            input: {
              prompt: "Test prompt",
              timestamp: "2024-03-20T10:00:00Z",
            },
            output: {
              response: "Test response",
              timestamp: "2024-03-20T10:00:01Z",
            },
          }
        }),
      })
    );
    
    expect(response.status).toBe(400);
  });
});
