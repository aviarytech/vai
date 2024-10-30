import { CONFIG } from '../config';

interface ClaudeResponse {
  content: Array<{ text: string }>;
  model: string;
}

export class ClaudeService {
  private static readonly API_URL = 'https://api.anthropic.com/v1/messages';
  private static readonly API_KEY = CONFIG.AI_SERVICE.API_KEY;
  private static readonly MODEL = CONFIG.AI_SERVICE.MODEL;

  static async generateResponse(prompt: string): Promise<{
    response: string;
    model: string;
  }> {
    if (CONFIG.AI_SERVICE.MOCK_RESPONSES) {
      console.log('Using mock response for Claude API');
      return {
        response: `[MOCK RESPONSE] This is a mock response to: "${prompt}"`,
        model: this.MODEL
      };
    }

    if (!this.API_KEY) {
      throw new Error('Claude API key is not configured');
    }

    try {
      console.log('Making request to Claude API with model:', this.MODEL);
      
      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'anthropic-version': '2023-06-01',
          'x-api-key': this.API_KEY
        },
        body: JSON.stringify({
          model: this.MODEL,
          messages: [{ 
            role: 'user', 
            content: prompt 
          }],
          max_tokens: 1024,
          system: "You are a helpful AI assistant."
        })
      });

      if (!response.ok) {
        const error = await response.json() as { error: { message: string } };
        console.error('Claude API Error Details:', {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
          error
        });
        throw new Error(`Claude API error: ${error.error.message}`);
      }

      const data = await response.json() as ClaudeResponse;
      console.log('Successful response from Claude API');
      
      return {
        response: data.content[0].text,
        model: data.model
      };
    } catch (error) {
      console.error('Error calling Claude API:', error);
      throw error;
    }
  }
}
