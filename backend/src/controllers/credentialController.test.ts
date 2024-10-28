import { describe, expect, it, beforeAll, afterAll, beforeEach } from "bun:test";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { Elysia } from "elysia";
import { Server } from "bun";
import { CONFIG } from "../config";
import { connectToDatabase, disconnectFromDatabase } from "../db";
import { credentialController } from "./credentialController";
import { getAICredentialModel } from "../models/AICredential";

describe("Credential Controller", () => {
  let mongoServer: MongoMemoryServer;
  let app: Elysia;
  let server: Server;

  beforeAll(async () => {
    // Set up in-memory MongoDB server
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    
    // Override the MongoDB URI for testing
    process.env.MONGODB_URI = mongoUri;
    CONFIG.MONGODB_URI = mongoUri;
    
    await connectToDatabase();

    // Create a new Elysia instance with the credential controller
    app = new Elysia().use(credentialController);
  });

  afterAll(async () => {
    await disconnectFromDatabase();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    // Clear the database before each test
    await mongoose.connection.dropDatabase();
  });

  describe("createCredential", () => {
    it("should create a new credential", async () => {
      const credentialData = {
        modelInfo: {
          name: "GPT-4",
          version: "1.0",
          provider: "OpenAI"
        },
        input: {
          prompt: "What is the capital of France?",
          timestamp: new Date().toISOString()
        },
        output: {
          response: "The capital of France is Paris.",
          timestamp: new Date().toISOString()
        }
      };

      const response = await app
        .handle(new Request("http://localhost/api/credentials", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(credentialData),
        }));

      expect(response.status).toBe(201);
    });

    it("should return 400 if required fields are missing", async () => {
      const incompleteData = {
        modelInfo: {
          name: "GPT-4",
          version: "1.0",
          // provider is missing
        },
        input: {
          prompt: "What is the capital of France?",
          timestamp: new Date().toISOString()
        },
        // output is missing
      };

      const response = await app
        .handle(new Request("http://localhost/api/credentials", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(incompleteData),
        }));

      expect(response.status).toBe(422);
    });
  });

  describe("getCredentials", () => {
    it("should return all credentials", async () => {
      const AICredential = getAICredentialModel();
      const credentialsData = [
        {
          modelInfo: { name: "GPT-4", version: "1.0", provider: "OpenAI" },
          input: { prompt: "Question 1", timestamp: new Date().toISOString() },
          output: { response: "Answer 1", timestamp: new Date().toISOString() }
        },
        {
          modelInfo: { name: "DALL-E", version: "2.0", provider: "OpenAI" },
          input: { prompt: "Question 2", timestamp: new Date().toISOString() },
          output: { response: "Answer 2", timestamp: new Date().toISOString() }
        }
      ];

      await AICredential.create(credentialsData);

      const response = await app
        .handle(new Request("http://localhost/api/credentials", {
          method: "GET",
        }));

      expect(response.status).toBe(200);
      const body:any = await response.json();
      expect(body).toHaveLength(2);
      
      const modelNames = body.map((cred: any) => cred.modelInfo.name);
      expect(modelNames).toContain("GPT-4");
      expect(modelNames).toContain("DALL-E");

      body.forEach((cred: any) => {
        expect(cred).toHaveProperty('modelInfo');
        expect(cred).toHaveProperty('input');
        expect(cred).toHaveProperty('output');
        expect(cred.modelInfo).toHaveProperty('name');
        expect(cred.modelInfo).toHaveProperty('version');
        expect(cred.modelInfo).toHaveProperty('provider');
        expect(cred.input).toHaveProperty('prompt');
        expect(cred.input).toHaveProperty('timestamp');
        expect(cred.output).toHaveProperty('response');
        expect(cred.output).toHaveProperty('timestamp');
      });
    });
  });

  it("should verify a valid credential by ID", async () => {
    // First create a credential
    const AICredential = getAICredentialModel();
    const credential = new AICredential({
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
    });
    await credential.save();

    const response = await app.handle(
      new Request("http://localhost/api/credentials/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          credentialId: (credential as any)._id.toString(),
        }),
      })
    );

    const result = await response.json();
    expect(response.status).toBe(200);
    expect((result as any).isValid).toBe(true);
  });

  it("should return 404 for non-existent credential ID", async () => {
    const response = await app.handle(
      new Request("http://localhost/api/credentials/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          credentialId: "000000000000000000000000",
        }),
      })
    );

    const result = await response.json();
    expect(response.status).toBe(404);
    expect((result as any).error).toBe("Credential not found");
  });

  it("should verify provided credential data", async () => {
    const response = await app.handle(
      new Request("http://localhost/api/credentials/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
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
        }),
      })
    );

    const result = await response.json();
    expect(response.status).toBe(200);
    expect((result as any).isValid).toBe(true);
  });
});
