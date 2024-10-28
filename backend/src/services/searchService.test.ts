import { describe, expect, it, beforeAll, afterAll, beforeEach } from "bun:test";
import { MongoMemoryServer } from "mongodb-memory-server";
import { CONFIG } from "../config";
import { connectToDatabase, disconnectFromDatabase } from "../db";
import { SearchService } from "./searchService";
import { getAICredentialModel } from "../models/AICredential";

describe("SearchService", () => {
  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    process.env.MONGODB_URI = mongoServer.getUri();
    CONFIG.MONGODB_URI = mongoServer.getUri();
    await connectToDatabase();
  });

  afterAll(async () => {
    await disconnectFromDatabase();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    const AICredential = getAICredentialModel();
    await AICredential.deleteMany({});

    // Insert test data
    await AICredential.insertMany([
      {
        modelInfo: {
          name: "GPT-4",
          version: "1.0",
          provider: "OpenAI"
        },
        input: {
          prompt: "What is quantum computing?",
          timestamp: "2024-03-20T10:00:00Z"
        },
        output: {
          response: "Quantum computing is...",
          timestamp: "2024-03-20T10:00:01Z"
        }
      },
      {
        modelInfo: {
          name: "Claude",
          version: "2.0",
          provider: "Anthropic"
        },
        input: {
          prompt: "Explain neural networks",
          timestamp: "2024-03-21T10:00:00Z"
        },
        output: {
          response: "Neural networks are...",
          timestamp: "2024-03-21T10:00:01Z"
        }
      }
    ]);
  });

  it("should find credentials by model name", async () => {
    const results = await SearchService.searchCredentials({ modelName: "GPT-4" });
    expect(results).toHaveLength(1);
    expect(results[0].modelInfo.name).toBe("GPT-4");
  });

  it("should find credentials by provider", async () => {
    const results = await SearchService.searchCredentials({ provider: "Anthropic" });
    expect(results).toHaveLength(1);
    expect(results[0].modelInfo.provider).toBe("Anthropic");
  });

  it("should find credentials by date range", async () => {
    const results = await SearchService.searchCredentials({
      startDate: "2024-03-20T00:00:00Z",
      endDate: "2024-03-20T23:59:59Z"
    });
    expect(results).toHaveLength(1);
    expect(results[0].modelInfo.name).toBe("GPT-4");
  });

  it("should find credentials by search term in prompt", async () => {
    const results = await SearchService.searchCredentials({
      searchTerm: "quantum"
    });
    expect(results).toHaveLength(1);
    expect(results[0].input.prompt).toContain("quantum");
  });

  it("should find credentials by search term in response", async () => {
    const results = await SearchService.searchCredentials({
      searchTerm: "networks"
    });
    expect(results).toHaveLength(1);
    expect(results[0].input.prompt).toContain("neural networks");
  });

  it("should return empty array when no matches found", async () => {
    const results = await SearchService.searchCredentials({
      modelName: "NonexistentModel"
    });
    expect(results).toHaveLength(0);
  });

  it("should handle multiple search criteria", async () => {
    const results = await SearchService.searchCredentials({
      provider: "OpenAI",
      searchTerm: "quantum"
    });
    expect(results).toHaveLength(1);
    expect(results[0].modelInfo.provider).toBe("OpenAI");
    expect(results[0].input.prompt).toContain("quantum");
  });
});
