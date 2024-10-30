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
