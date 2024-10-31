import { Elysia } from 'elysia'
import { ConversationController } from '../controllers/ConversationController'

const conversationController = new ConversationController()

export const conversationRoutes = new Elysia({ prefix: '/api' })
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
  