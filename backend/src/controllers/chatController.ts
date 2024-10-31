import { Elysia, t } from 'elysia';
import { ChatService } from '../services/chatService';
import { ConversationController } from './ConversationController';

const conversationController = new ConversationController();

export const chatController = new Elysia({ prefix: '/api' })
  .post('/chat', async ({ body, set }) => {
    const { prompt, conversationId } = body;

    if (!prompt?.trim()) {
      set.status = 400;
      return { success: false, error: 'Prompt is required' };
    }

    if (!conversationId) {
      set.status = 400;
      return { success: false, error: 'Conversation ID is required' };
    }

    try {
      // Verify conversation exists
      const conversationResult = await conversationController.getConversationById(conversationId);
      if (!conversationResult.success) {
        set.status = 404;
        return { success: false, error: 'Conversation not found' };
      }

      // Process chat message
      const chatResult = await ChatService.processChat(prompt, conversationId);
      
      return {
        success: true,
        response: chatResult.response,
        conversationId,
        credentialId: conversationId
      };
    } catch (error) {
      console.error('Chat error:', error);
      set.status = 500;
      return { success: false, error: 'Failed to process chat request' };
    }
  }, {
    body: t.Object({
      prompt: t.String(),
      conversationId: t.String()
    })
  });
