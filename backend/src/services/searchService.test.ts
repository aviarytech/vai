import { describe, it, beforeAll, afterAll, beforeEach, expect } from 'bun:test';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { connectToDatabase, disconnectFromDatabase } from '../db';
import { getAICredentialModel } from '../models/AICredential';
import { SearchService } from './searchService';
import { CONFIG } from '../config';

describe('SearchService', () => {
  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    CONFIG.MONGODB_URI = mongoUri;
    await connectToDatabase();
  });

  afterAll(async () => {
    await disconnectFromDatabase();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    const AICredential = getAICredentialModel();
    await AICredential.deleteMany({});
  });

  it('should find credentials by model name', async () => {
    const AICredential = getAICredentialModel();
    const testCredential = {
      '@context': ['https://www.w3.org/2018/credentials/v1'],
      type: ['VerifiableCredential', 'AICredential'],
      issuer: { id: 'did:example:123' },
      id: 'urn:uuid:123',
      issuanceDate: new Date().toISOString(),
      credentialSubject: {
        id: 'urn:uuid:123',
        modelInfo: {
          name: 'test-model',
          version: '1.0',
          provider: 'test-provider'
        },
        input: {
          prompt: 'test prompt',
          timestamp: new Date().toISOString()
        },
        output: {
          response: 'test response',
          timestamp: new Date().toISOString()
        }
      },
      proof: {
        type: 'Ed25519Signature2020',
        created: new Date().toISOString(),
        verificationMethod: 'did:example:123#key-1',
        proofPurpose: 'assertionMethod',
        proofValue: 'test'
      }
    };

    await AICredential.create(testCredential);

    const results = await SearchService.searchCredentials({ modelName: 'test-model' });
    expect(results.length).toBe(1);
    expect(results[0].credentialSubject.modelInfo.name).toBe('test-model');
  });

  // Add more test cases for other search criteria
});
