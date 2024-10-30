import { getAICredentialModel } from '../models/AICredential';
import { ClaudeService } from './claudeService';
import { CONFIG } from '../config';

export interface ChatResponse {
  response: string;
  verifiableCredential: AcesVerifiableCredential;
}

interface AcesVerifiableCredential {
  id: string;
  '@context': string[];
  type: string[];
  issuer: {
    id: string;
    name?: string;
  };
  credentialSubject: {
    id: string;
    modelInfo: {
      name: string;
      version: string;
      provider: string;
    };
    input: {
      prompt: string;
      timestamp: string;
    };
    output: {
      response: string;
      timestamp: string;
    };
  };
  issuanceDate: string;
  proof: {
    type: string;
    created: string;
    verificationMethod: string;
    proofPurpose: string;
    proofValue: string;
  };
}

export class ChatService {
  static async processChat(prompt: string): Promise<ChatResponse> {
    try {
      const startTimestamp = new Date().toISOString();
      const { response, model } = await ClaudeService.generateResponse(prompt);
      const timestamp = new Date().toISOString();
      try {
        const acesResponse = await fetch(`${CONFIG.ACES_API_URL}/credentials`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${CONFIG.ACES_API_KEY}`
          },
          body: JSON.stringify({
            templateId: CONFIG.ACES_TEMPLATE_ID,
            credentialSubject: {
              modelInfo: {
                name: "Claude",
                version: model,
                provider: "Anthropic"
              },
              input: {
                prompt,
                startTimestamp
              },
              output: {
                response,
                timestamp
              }
            }
          })
        });

        if (!acesResponse.ok) {
          let errorDetail = '';
          try {
            const errorBody = await acesResponse.json();
            errorDetail = JSON.stringify(errorBody);
          } catch {
            try {
              errorDetail = await acesResponse.text();
            } catch {
              errorDetail = 'No error details available';
            }
          }

          throw new Error(
            `Aces API error (${acesResponse.status}): ${acesResponse.statusText}\n` +
            `URL: ${CONFIG.ACES_API_URL}/credentials\n` +
            `Error details: ${errorDetail}`
          );
        }

        const verifiableCredential = await acesResponse.json() as AcesVerifiableCredential;
        
        // Save the entire verifiable credential as our document
        const AICredential = getAICredentialModel();
        const credential = new AICredential(verifiableCredential);
        await credential.save();

        return {
          response,
          verifiableCredential
        };

      } catch (error) {
        if (error instanceof TypeError && error.message === 'Failed to fetch') {
          throw new Error(
            `Failed to connect to Aces API at ${CONFIG.ACES_API_URL}. ` +
            'Please check if the service is running and the URL is correct.'
          );
        }

        if (error instanceof Error) {
          console.error('Detailed Aces API error:', error);
          throw new Error(
            `Failed to create verifiable credential: ${error.message}\n` +
            'Please check the server logs for more details.'
          );
        }

        console.error('Unknown error while creating verifiable credential:', error);
        throw new Error(
          'An unexpected error occurred while creating the verifiable credential. ' +
          'Please check the server logs for more details.'
        );
      }

    } catch (error) {
      console.error('Error processing chat:', error);
      throw error;
    }
  }
}
