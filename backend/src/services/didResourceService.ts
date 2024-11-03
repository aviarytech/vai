import { CONFIG } from '../config';
import { IVerifiableCredential } from '../models/AICredential';

export interface IVerifiablePresentation {
  "@context": string[];
  type: string[];
  verifiableCredential: IVerifiableCredential[];
}

interface LinkedResourceMetadata {
  resourceId: string;
  resourceName: string;
  resourceType: string;
  created: string;
}

interface SearchResponse {
  contentStream: {
    linkedResourceMetadata: LinkedResourceMetadata[];
  };
}

export class DIDResourceService {
  async publishResource(conversationId: string, verifiablePresentation: any): Promise<boolean> {
    try {
      const apiKey = CONFIG.CHEQD_API_KEY;
      const url = `https://studio-api.cheqd.net/resource/create/${CONFIG.CHEQD_DID}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'x-api-key': apiKey,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          data: Buffer.from(JSON.stringify(verifiablePresentation)).toString('base64url'),
          encoding: 'base64url',
          name: `Conversation ${conversationId}`,
          type: 'LLMConversation',
          alsoKnownAs: '',
          version: '',
          publicKeyHexs: ''
        })
      });

      if (!response.ok) {
        const errorData = await response.json() as { error: string };
        throw new Error(`Failed to publish resource: ${errorData.error || response.statusText}`);
      }

      return true;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async queryResources(): Promise<LinkedResourceMetadata[]> {
    try {
      const apiKey = CONFIG.CHEQD_API_KEY;
      const url = `https://studio-api.cheqd.net/resource/search/${CONFIG.CHEQD_DID}?resourceMetadata=true`;
      
      const response = await fetch(url, {
        headers: {
          'accept': 'application/json',
          'x-api-key': apiKey
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to query resources: ${response.statusText}`);
      }

      const data = await response.json() as SearchResponse;
      return data.contentStream.linkedResourceMetadata;
    } catch (error) {
      console.error('Error querying resources:', error);
      throw error;
    }
  }

  async getResource(resourceId: string): Promise<IVerifiablePresentation | null> {
    try {
      const apiKey = CONFIG.CHEQD_API_KEY;
      const url = `https://studio-api.cheqd.net/resource/search/${CONFIG.CHEQD_DID}?resourceId=${resourceId}`;
      
      const response = await fetch(url, {
        headers: {
          'accept': 'application/json',
          'x-api-key': apiKey
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to get resource: ${response.statusText}`);
      }
      
      return await response.json() as IVerifiablePresentation;
    } catch (error) {
      console.error('Error getting resource:', error);
      return null;
    }
  }

  async getResourcesWithContent(): Promise<IVerifiablePresentation[]> {
    try {
      const resources = await this.queryResources();
      
      const resourcesWithContent = await Promise.all(
        resources.map(async (resource) => {
          try {
            return await this.getResource(resource.resourceId);
          } catch (error) {
            console.error(`Failed to fetch content for resource ${resource.resourceId}:`, error);
            return null
          }
        })
      );
      return resourcesWithContent.filter(resource => resource !== null) as IVerifiablePresentation[];
    } catch (error) {
      console.error('Error fetching resources with content:', error);
      throw error;
    }
  }
} 