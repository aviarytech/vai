import { Elysia } from 'elysia'
import { ConversationController } from '../controllers/ConversationController'
import { DIDResourceService } from '../services/didResourceService'

const conversationController = new ConversationController()

export const conversationRoutes = new Elysia({ prefix: '/api' })
  .get('/conversations/published', async () => {
    const didResourceService = new DIDResourceService();
    try {
      const resources = await didResourceService.getResourcesWithContent();
      return { success: true, resources };
    } catch (error) {
      console.error('Error fetching published conversations:', error);
      return { success: false, error: 'Failed to fetch published conversations' };
    }
  })
  .get('/conversations/published/:id', async ({ params: { id } }) => {
    const didResourceService = new DIDResourceService();
    try {
      const resource = await didResourceService.getResource(id);
      if (!resource) {
        return { success: false, error: 'Published conversation not found' };
      }
      return { success: true, data: resource };
    } catch (error) {
      console.error('Error fetching published conversation:', error);
      return { success: false, error: 'Failed to fetch published conversation' };
    }
  })
  .get('/conversations', async () => {
    console.log('GET /conversations')
    const result = await conversationController.getAllConversations()
    if (!result.success) {
      return { error: result.error }
    }
    return result
  })
  .get('/conversations/:id', async ({ params: { id } }) => {
    console.log('GET /conversations/:id', id)
    const result = await conversationController.getConversationById(id)
    if (!result.success) {
      return { error: result.error }
    }
    return result
  })
  .post('/conversations', async () => {
    console.log('POST /conversations')
    const result = await conversationController.createConversation()
    if (!result.success) {
      return { error: result.error }
    }
    return result
  })
  .post('/conversations/:id/publish', async ({ params: { id }, set }) => {
    console.log('POST /conversations/:id/publish', id)
    try {
      const result = await conversationController.publishConversation(id)
      if (!result.success) {
        set.status = 400
        return { success: false, error: result.error }
      }
      return result
    } catch (error) {
      console.error('Error publishing conversation:', error)
      set.status = 500
      return { success: false, error: 'Failed to publish conversation' }
    }
  })
  