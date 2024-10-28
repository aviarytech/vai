import { describe, expect, it, beforeAll, afterAll } from "bun:test";
import { MongoMemoryServer } from "mongodb-memory-server";
import { CONFIG } from "../config";
import { connectToDatabase, disconnectFromDatabase } from "../db";
import { VerificationRecord } from "./VerificationRecord";

describe("VerificationRecord Model", () => {
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

  it("should create a verification record", async () => {
    const record = new VerificationRecord({
      credentialId: "test123",
      timestamp: new Date().toISOString(),
      result: {
        isValid: true,
        details: {
          modelVerified: true,
          timestampVerified: true,
          inputOutputMatch: true
        }
      }
    });

    await record.save();
    const savedRecord = await VerificationRecord.findById(record._id);
    expect(savedRecord).toBeTruthy();
    expect(savedRecord?.credentialId).toBe("test123");
    expect(savedRecord?.result.isValid).toBe(true);
  });

  it("should require all necessary fields", async () => {
    const invalidRecord = new VerificationRecord({
      credentialId: "test123"
      // Missing required fields
    });

    await expect(invalidRecord.save()).rejects.toThrow();
  });

  it("should store verification details correctly", async () => {
    const record = new VerificationRecord({
      credentialId: "test123",
      timestamp: new Date().toISOString(),
      result: {
        isValid: false,
        details: {
          modelVerified: true,
          timestampVerified: false,
          inputOutputMatch: true
        }
      }
    });

    await record.save();
    const savedRecord = await VerificationRecord.findById(record._id);
    expect(savedRecord?.result.details.timestampVerified).toBe(false);
    expect(savedRecord?.result.details.modelVerified).toBe(true);
    expect(savedRecord?.result.details.inputOutputMatch).toBe(true);
  });
});
