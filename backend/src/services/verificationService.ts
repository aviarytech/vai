import { IAICredential } from '../models/AICredential';

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
  static async verifyCredential(credential: IAICredential): Promise<VerificationResult> {
    try {
      // Verify model info exists
      const modelVerified = Boolean(
        credential.modelInfo?.name &&
        credential.modelInfo?.version &&
        credential.modelInfo?.provider
      );

      // Verify timestamps are valid and input timestamp is before output
      const inputTime = new Date(credential.input.timestamp).getTime();
      const outputTime = new Date(credential.output.timestamp).getTime();
      const timestampVerified = !isNaN(inputTime) && 
                               !isNaN(outputTime) && 
                               inputTime < outputTime;

      // Verify input and output exist and make sense together
      const inputOutputMatch = Boolean(
        credential.input?.prompt &&
        credential.output?.response
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
