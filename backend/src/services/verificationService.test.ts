import { describe, expect, it, beforeAll, afterAll } from "bun:test";
import { MongoMemoryServer } from "mongodb-memory-server";
import { CONFIG } from "../config";
import { connectToDatabase, disconnectFromDatabase } from "../db";
import { VerificationService } from "./verificationService";
import { IAICredential } from "../models/AICredential";

describe("VerificationService", () => {
  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    // Set up in-memory MongoDB server
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    
    // Override the MongoDB URI for testing
    process.env.MONGODB_URI = mongoUri;
    CONFIG.MONGODB_URI = mongoUri;
    
    await connectToDatabase();
  });

  afterAll(async () => {
    await disconnectFromDatabase();
    await mongoServer.stop();
  });

  it("should verify a valid credential", async () => {
    const validCredential = {
      modelInfo: {
        name: "GPT-4",
        version: "1.0",
        provider: "OpenAI",
      },
      input: {
        prompt: "What is the meaning of life?",
        timestamp: "2024-03-20T10:00:00Z",
      },
      output: {
        response: "42",
        timestamp: "2024-03-20T10:00:01Z",
      },
    } as IAICredential;

    const result = await VerificationService.verifyCredential(validCredential);
    expect(result.isValid).toBe(true);
    expect(result.details.modelVerified).toBe(true);
    expect(result.details.timestampVerified).toBe(true);
    expect(result.details.inputOutputMatch).toBe(true);
  });

  it("should fail verification for invalid timestamps", async () => {
    const invalidTimestampCredential = {
      modelInfo: {
        name: "GPT-4",
        version: "1.0",
        provider: "OpenAI",
      },
      input: {
        prompt: "What is the meaning of life?",
        timestamp: "2024-03-20T10:00:02Z", // Input after output
      },
      output: {
        response: "42",
        timestamp: "2024-03-20T10:00:01Z",
      },
    } as IAICredential;

    const result = await VerificationService.verifyCredential(invalidTimestampCredential);
    expect(result.isValid).toBe(false);
    expect(result.details.timestampVerified).toBe(false);
  });

  it("should fail verification for missing model info", async () => {
    const missingModelInfoCredential = {
      modelInfo: {
        name: "",
        version: "",
        provider: "",
      },
      input: {
        prompt: "What is the meaning of life?",
        timestamp: "2024-03-20T10:00:00Z",
      },
      output: {
        response: "42",
        timestamp: "2024-03-20T10:00:01Z",
      },
    } as IAICredential;

    const result = await VerificationService.verifyCredential(missingModelInfoCredential);
    expect(result.isValid).toBe(false);
    expect(result.details.modelVerified).toBe(false);
  });
});
