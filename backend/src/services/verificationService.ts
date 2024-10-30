import { IVerifiableCredential } from "../models/AICredential";

export interface VerificationResult {
  isValid: boolean;
  details: {
    modelVerified: boolean;
    timestampVerified: boolean;
    inputOutputMatch: boolean;
  };
  error?: string;
}

export class VerificationService {
  static async verifyCredential(credential: IVerifiableCredential): Promise<VerificationResult> {
    try {
      // Verify model info exists
      const modelVerified = Boolean(
        credential.credentialSubject.modelInfo?.name &&
        credential.credentialSubject.modelInfo?.version &&
        credential.credentialSubject.modelInfo?.provider
      );

      // Verify timestamps are valid and input timestamp is before output
      const inputTime = new Date(credential.credentialSubject.input.timestamp).getTime();
      const outputTime = new Date(credential.credentialSubject.output.timestamp).getTime();
      const timestampVerified = !isNaN(inputTime) && 
                               !isNaN(outputTime) && 
                               inputTime < outputTime;

      // Verify input and output exist and make sense together
      const inputOutputMatch = Boolean(
        credential.credentialSubject.input?.prompt &&
        credential.credentialSubject.output?.response
      );

      const isValid = modelVerified && timestampVerified && inputOutputMatch;

      return {
        isValid,
        details: {
          modelVerified,
          timestampVerified,
          inputOutputMatch,
        }
      };
    } catch (error) {
      console.error(error)
      return {
        isValid: false,
        details: {
          modelVerified: false,
          timestampVerified: false,
          inputOutputMatch: false,
        },
        error: 'Verification failed due to invalid credential format'
      };
    }
  }
}
