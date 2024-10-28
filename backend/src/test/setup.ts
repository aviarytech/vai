/// <reference path="./types.ts" />

import { beforeAll, afterAll } from 'bun:test';
import { MongoMemoryServer } from "mongodb-memory-server";
import { CONFIG } from "../config";
import { connectToDatabase, disconnectFromDatabase } from "../db";
import { TestTimer, setupTestRunner } from "./runner";
import { generatePerformanceReport } from "./performance-report";

// Initialize test runner
setupTestRunner();

let mongoServer: MongoMemoryServer;

export async function setupTestDB() {
  TestTimer.start('setupTestDB');
  if (!mongoServer) {
    mongoServer = await MongoMemoryServer.create({
      instance: {
        dbName: 'test-db',
        storageEngine: 'ephemeralForTest',
      }
    });
    const mongoUri = mongoServer.getUri();
    process.env.MONGODB_URI = mongoUri;
    CONFIG.MONGODB_URI = mongoUri;
    await connectToDatabase();
  }
  TestTimer.end('setupTestDB');
  return mongoServer;
}

export async function teardownTestDB() {
  TestTimer.start('teardownTestDB');
  if (mongoServer) {
    await disconnectFromDatabase();
    await mongoServer.stop();
    mongoServer = null as any;
  }
  TestTimer.end('teardownTestDB');
}

export async function clearCollections() {
  TestTimer.start('clearCollections');
  const db = (await connectToDatabase()).connection.db;
  const collections = await db?.collections();
  if (collections) {
    await Promise.all(collections.map(c => c.deleteMany({})));
  }
  TestTimer.end('clearCollections');
}

// Add global before/after hooks for all test files
beforeAll(async () => {
  TestTimer.reset();
});

afterAll(() => {
  console.error('Generating performance report after all tests...');
  generatePerformanceReport();
});
