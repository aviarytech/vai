import { describe, expect, it, beforeAll, afterAll } from "bun:test";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { AICredentialModel } from "./AICredential";

describe("AICredential Model", () => {
  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  it("should create and save an AICredential successfully", async () => {
    const validAICredential = new AICredentialModel({
      modelInfo: {
        name: "GPT-4",
        version: "1.0",
        provider: "OpenAI",
      },
      input: {
        prompt: "What is the capital of France?",
        timestamp: new Date().toISOString(),
      },
      output: {
        response: "The capital of France is Paris.",
        timestamp: new Date().toISOString(),
      },
    });

    const savedAICredential = await validAICredential.save();
    expect(savedAICredential._id).toBeDefined();
    expect(savedAICredential.modelInfo.name).toBe("GPT-4");
    expect(savedAICredential.input.prompt).toBe("What is the capital of France?");
    expect(savedAICredential.output.response).toBe("The capital of France is Paris.");
  });

  it("should fail to save an AICredential with missing required fields", async () => {
    const invalidAICredential = new AICredentialModel({
      modelInfo: {
        name: "GPT-4",
        // Missing version and provider
      },
      input: {
        prompt: "What is the capital of France?",
        // Missing timestamp
      },
      // Missing output
    });

    let error;
    try {
      await invalidAICredential.save();
    } catch (e) {
      error = e;
    }
    expect(error).toBeDefined();
    expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
    expect((error as any).errors['modelInfo.version']).toBeDefined();
    expect((error as any).errors['modelInfo.provider']).toBeDefined();
    expect((error as any).errors['input.timestamp']).toBeDefined();
    // expect((error as any).errors['output']).toBeDefined();
  });

  it("should retrieve an AICredential from the database", async () => {
    const aiCredential = new AICredentialModel({
      modelInfo: {
        name: "GPT-4",
        version: "1.0",
        provider: "OpenAI",
      },
      input: {
        prompt: "What is the capital of France?",
        timestamp: new Date().toISOString(),
      },
      output: {
        response: "The capital of France is Paris.",
        timestamp: new Date().toISOString(),
      },
    });

    await aiCredential.save();

    const retrievedCredential = await AICredentialModel.findOne({ 'modelInfo.name': 'GPT-4' });
    expect(retrievedCredential).toBeDefined();
    expect(retrievedCredential?.modelInfo.name).toBe("GPT-4");
    expect(retrievedCredential?.input.prompt).toBe("What is the capital of France?");
  });
});
