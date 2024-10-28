import { describe, expect, it, beforeAll, afterAll } from "bun:test";
import mongoose from "mongoose";
import { setupTestDB, teardownTestDB } from "./test/setup";
import { connectToDatabase, disconnectFromDatabase } from "./db";
import { CONFIG } from "./config";

describe("Database Connection", () => {
  beforeAll(async () => {
    await setupTestDB();
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  it("should connect to the database", async () => {
    const connection = await connectToDatabase();
    expect(connection.connection.readyState).toBe(1);
  });

  it("should reuse existing connection", async () => {
    const connection1 = await connectToDatabase();
    const connection2 = await connectToDatabase();
    expect(connection1).toBe(connection2);
  });

  it("should handle connection errors", async () => {
    // Disconnect first
    await disconnectFromDatabase();
    
    // Save original URI
    const originalUri = CONFIG.MONGODB_URI;
    
    try {
      // Set invalid URI with non-routable IP to fail fast
      CONFIG.MONGODB_URI = "mongodb://240.0.0.0:27017/test";
      
      // Attempt connection with short timeouts
      await expect(connectToDatabase({
        serverSelectionTimeoutMS: 500,
        connectTimeoutMS: 500,
      })).rejects.toThrow('Failed to connect to MongoDB');
    } finally {
      // Restore original URI
      CONFIG.MONGODB_URI = originalUri;
    }
  });

  it("should disconnect properly", async () => {
    await connectToDatabase();
    expect(mongoose.connection.readyState).toBe(1);
    await disconnectFromDatabase();
    expect(mongoose.connection.readyState).toBe(0);
  });
});
