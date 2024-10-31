import { getAICredentialModel } from '../models/AICredential';
import { CONFIG } from '../config';
import { ClaudeService } from './claudeService';

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
  static async processChat(prompt: string, conversationId: string): Promise<ChatResponse> {
    try {
      // Get previous messages from conversation
      const AICredential = getAICredentialModel();
      const previousCredentials = await AICredential.find({
        'credentialSubject.id': conversationId
      }).sort({ 'credentialSubject.timestamp': 1 });

      // Transform VCs into Claude message format
      const previousMessages = previousCredentials.flatMap(vc => [
        {
          role: 'user' as const,
          content: vc.credentialSubject.input.prompt
        },
        {
          role: 'assistant' as const,
          content: vc.credentialSubject.output.response
        }
      ]);

      // Add current prompt as the last message
      const messages = [
        ...previousMessages,
        {
          role: 'user' as const,
          content: prompt
        }
      ];

      // Get response from Claude
      const { response: aiResponse, model } = await ClaudeService.generateResponse(messages);

      // Create verifiable credential
      const acesResponse = await fetch(CONFIG.ACES_API_URL + '/credentials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${CONFIG.ACES_API_KEY}`
        },
        body: JSON.stringify({
          templateId: CONFIG.ACES_TEMPLATE_ID,
          credentialSubject: {
            id: conversationId,
            modelInfo: {
              name: CONFIG.AI_SERVICE.PROVIDER,
              version: CONFIG.AI_SERVICE.MODEL,
              provider: "Anthropic"
            },
            input: {
              prompt,
              timestamp: new Date().toISOString()
            },
            output: {
              response: aiResponse,
              timestamp: new Date().toISOString()
            }
          }
        })
      });

      if (!acesResponse.ok) {
        throw new Error(`Failed to create verifiable credential: ${acesResponse.statusText}`);
      }

      const verifiableCredential = await acesResponse.json() as AcesVerifiableCredential;
      console.log(`Saving VC with ID: ${conversationId}`, verifiableCredential);
      
      // Save the entire verifiable credential
      const credential = new AICredential(verifiableCredential);
      await credential.save();

      return {
        response: aiResponse,
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
  }
}
