import { describe, expect, it, beforeAll, afterAll, beforeEach } from "bun:test";
import { MongoMemoryServer } from "mongodb-memory-server";
import { Elysia } from "elysia";
import { CONFIG } from "../config";
import { connectToDatabase, disconnectFromDatabase } from "../db";
import { getAICredentialModel } from "../models/AICredential";
import { errorHandler } from "../middleware/errorHandler";

describe("Credential Controller", () => {
  let mongoServer: MongoMemoryServer;
  let app: Elysia;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    CONFIG.MONGODB_URI = mongoUri;
    await connectToDatabase();
    
    // Import controller after database connection
    const { credentialController } = await import("./credentialController");
    app = new Elysia().onError(errorHandler).use(credentialController);
  });

  afterAll(async () => {
    await disconnectFromDatabase();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    const AICredential = getAICredentialModel();
    await AICredential.deleteMany({});
  });

  describe("createCredential", () => {
    it("should create a new credential", async () => {
      const credentialData = {
        '@context': ['https://www.w3.org/2018/credentials/v1'],
        type: ['VerifiableCredential', 'AICredential'],
        issuer: { id: 'did:example:123' },
        id: 'urn:uuid:456',
        issuanceDate: new Date().toISOString(),
        credentialSubject: {
          id: 'urn:uuid:123',
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
        },
        proof: {
          type: "Ed25519Signature2020",
          created: new Date().toISOString(),
          verificationMethod: "did:example:123#key-1",
          proofPurpose: "assertionMethod",
          proofValue: "test"
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

      expect(response.status).toBe(400);
    });
  });

  describe("getCredentials", () => {
    it("should return all credentials", async () => {
      const AICredential = getAICredentialModel();
      const credentialsData = [
        {
          '@context': ['https://www.w3.org/2018/credentials/v1'],
          type: ['VerifiableCredential', 'AICredential'],
          issuer: { id: 'did:example:123' },
          id: 'urn:uuid:123',
          issuanceDate: new Date().toISOString(),
          credentialSubject: {
            id: 'urn:uuid:def',
            modelInfo: { name: "GPT-4", version: "1.0", provider: "OpenAI" },
            input: { prompt: "Question 1", timestamp: new Date().toISOString() },
            output: { response: "Answer 1", timestamp: new Date().toISOString() }
          },
          proof: {
            type: "Ed25519Signature2020",
            created: new Date().toISOString(),
            verificationMethod: "did:example:123#key-1",
            proofPurpose: "assertionMethod",
            proofValue: "test"
          }
        },
        {
          '@context': ['https://www.w3.org/2018/credentials/v1'],
          type: ['VerifiableCredential', 'AICredential'],
          issuer: { id: 'did:example:123' },
          id: 'urn:uuid:456',
          issuanceDate: new Date().toISOString(),
          credentialSubject: {
            id: 'urn:uuid:abc',
            modelInfo: { name: "DALL-E", version: "2.0", provider: "OpenAI" },
            input: { prompt: "Question 2", timestamp: new Date().toISOString() },
            output: { response: "Answer 2", timestamp: new Date().toISOString() }
          },
          proof: {
            type: "Ed25519Signature2020",
            created: new Date().toISOString(),
            verificationMethod: "did:example:123#key-1",
            proofPurpose: "assertionMethod",
            proofValue: "test"
          }
        }
      ];

      await AICredential.create(credentialsData);

      const response = await app
        .handle(new Request("http://localhost/api/credentials", {
          method: "GET",
        }));

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body).toHaveLength(2);
      
      const modelNames = (body as any).map((cred: any) => cred.credentialSubject.modelInfo.name);
      expect(modelNames).toContain("GPT-4");
      expect(modelNames).toContain("DALL-E");

      (body as any).forEach((cred: any) => {
        expect(cred.credentialSubject).toHaveProperty('modelInfo');
        expect(cred.credentialSubject).toHaveProperty('input');
        expect(cred.credentialSubject).toHaveProperty('output');
        expect(cred.credentialSubject.modelInfo).toHaveProperty('name');
        expect(cred.credentialSubject.modelInfo).toHaveProperty('version');
        expect(cred.credentialSubject.modelInfo).toHaveProperty('provider');
        expect(cred.credentialSubject.input).toHaveProperty('prompt');
        expect(cred.credentialSubject.input).toHaveProperty('timestamp');
        expect(cred.credentialSubject.output).toHaveProperty('response');
        expect(cred.credentialSubject.output).toHaveProperty('timestamp');
      });
    });
  });

  it("should verify a valid credential by ID", async () => {
    // First create a credential
    const AICredential = getAICredentialModel();
    const credential = new AICredential({
      '@context': ['https://www.w3.org/2018/credentials/v1'],
      type: ['VerifiableCredential', 'AICredential'],
      issuer: { id: 'did:example:123' },
      id: 'urn:uuid:456',
      issuanceDate: new Date().toISOString(),
      credentialSubject: {
        id: 'urn:uuid:123',
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
        }
      },
      proof: {
        type: "Ed25519Signature2020",
        created: new Date().toISOString(),
        verificationMethod: "did:example:123#key-1",
        proofPurpose: "assertionMethod",
        proofValue: "test"
      }
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

  it("should fail to verify provided credential data", async () => {
    const response = await app.handle(
      new Request("http://localhost/api/credentials/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
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
