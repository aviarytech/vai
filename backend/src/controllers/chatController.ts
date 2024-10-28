import { Elysia, t } from 'elysia';
import { ChatService, ChatResponse } from '../services/chatService';

export const chatController = new Elysia({ prefix: '/api' })
  .post('/chat', async ({ body, set }): Promise<ChatResponse | { error: string }> => {
    const { prompt } = body;

    if (!prompt?.trim()) {
      set.status = 400;
      return { error: 'Prompt is required' };
    }

    try {
      const result = await ChatService.processChat(prompt);
      return result;
    } catch (error) {
      console.error('Chat error:', error);
      set.status = 500;
      return { error: 'Failed to process chat request' };
    }
  }, {
    body: t.Object({
      prompt: t.String()
    })
  });
