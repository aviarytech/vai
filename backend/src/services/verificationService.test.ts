import { describe, expect, it } from "bun:test";
import { VerificationService } from "./verificationService";
import { IVerifiableCredential } from "../models/AICredential";

describe("VerificationService", () => {
  it("should verify a valid credential", async () => {
    const validCredential: IVerifiableCredential = {
      '@context': ['https://www.w3.org/2018/credentials/v1'],
      type: ['VerifiableCredential', 'AICredential'],
      issuer: { id: 'did:example:123' },
      issuanceDate: new Date().toISOString(),
      credentialSubject: {
        modelInfo: {
          name: "GPT-4",
          version: "1.0",
          provider: "OpenAI"
        },
        input: {
          prompt: "Test prompt",
          timestamp: "2024-03-20T10:00:00Z"
        },
        output: {
          response: "Test response",
          timestamp: "2024-03-20T10:00:01Z"
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

    const result = await VerificationService.verifyCredential(validCredential);
    expect(result.isValid).toBe(true);
    expect(result.details.modelVerified).toBe(true);
    expect(result.details.timestampVerified).toBe(true);
    expect(result.details.inputOutputMatch).toBe(true);
  });

  it("should fail verification for invalid timestamps", async () => {
    const invalidTimestampCredential: IVerifiableCredential = {
      "@context": ["https://www.w3.org/2018/credentials/v1"],
      type: ["VerifiableCredential", "AICredential"],
      issuer: { id: "did:example:123" },
      issuanceDate: "2024-03-20T10:00:00Z",
      credentialSubject: {
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
      },
      proof: {
        type: "Ed25519Signature2020",
        created: new Date().toISOString(),
        verificationMethod: "did:example:123#key-1",
        proofPurpose: "assertionMethod",
        proofValue: "test"
      }
    };

    const result = await VerificationService.verifyCredential(invalidTimestampCredential);
    expect(result.isValid).toBe(false);
    expect(result.details.timestampVerified).toBe(false);
  });

  it("should fail verification for missing model info", async () => {
    const missingModelInfoCredential: IVerifiableCredential = {
      "@context": ["https://www.w3.org/2018/credentials/v1"],
      type: ["VerifiableCredential", "AICredential"],
      issuer: { id: "did:example:123" },
      issuanceDate: "2024-03-20T10:00:00Z",
      credentialSubject: {
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
      },
      proof: {
        type: "Ed25519Signature2020",
        created: new Date().toISOString(),
        verificationMethod: "did:example:123#key-1",
        proofPurpose: "assertionMethod",
        proofValue: "test"
      }
    };

    const result = await VerificationService.verifyCredential(missingModelInfoCredential);
    expect(result.isValid).toBe(false);
    expect(result.details.modelVerified).toBe(false);
  });
});
