import { Conversation } from '../models/Conversation'
import { randomUUID } from 'crypto'
import { getAICredentialModel } from '../models/AICredential'
import { DIDResourceService } from '../services/didResourceService';

export class ConversationController {
  private didResourceService: DIDResourceService;

  constructor() {
    this.didResourceService = new DIDResourceService();
  }

  async getAllConversations() {
    try {
      const conversations = await Conversation.find()
        .sort({ createdAt: -1 });

      const AICredential = getAICredentialModel();
      
      // Get message counts and first messages
      const conversationData = await AICredential.aggregate([
        {
          $sort: { 'credentialSubject.input.timestamp': 1 }
        },
        {
          $group: {
            _id: '$credentialSubject.id',
            count: { $sum: 1 },
            firstMessage: { $first: '$credentialSubject.input.prompt' }
          }
        }
      ]);

      // Create a map for quick lookup
      const dataMap = new Map(
        conversationData.map(item => [item._id, {
          count: item.count * 2, // Multiply by 2 to account for both prompt and response
          firstMessage: item.firstMessage
        }])
      );

      // Add counts and first messages to conversations
      const conversationsWithData = conversations.map(conversation => {
        const data = dataMap.get(conversation.id) || { count: 0, firstMessage: null };
        
        return {
          ...conversation.toObject(),
          messageCount: data.count,
          verifiablePresentation: {
            verifiableCredential: data.firstMessage ? [{
              credentialSubject: {
                input: {
                  prompt: data.firstMessage
                }
              }
            }] : []
          }
        };
      });

      return { success: true, data: conversationsWithData };
    } catch (error) {
      console.error('Error fetching conversations:', error);
      return { success: false, error: 'Failed to fetch conversations' };
    }
  }

  async getConversationById(id: string) {
    try {
      // First check if conversation exists
      const conversation = await Conversation.findOne({ id })
      if (!conversation) {
        return { success: false, error: 'Conversation not found' }
      }
      // Get all credentials for this conversation
      const AICredential = getAICredentialModel()
      const credentials = await AICredential.find({
        'credentialSubject.id': id
      }).sort({ 'credentialSubject.timestamp': 1 })

      // Construct VP
      const verifiablePresentation = {
        "@context": ["https://www.w3.org/2018/credentials/v1"],
        type: ["VerifiablePresentation"],
        verifiableCredential: credentials
      }

      // Return conversation with VP
      return { 
        success: true, 
        data: {
          ...conversation.toObject(),
          verifiablePresentation
        }
      }
    } catch (error) {
      console.error('Error getting conversation:', error)
      return { success: false, error: 'Failed to fetch conversation' }
    }
  }

  async createConversation() {
    try {
      const id = `urn:uuid:${randomUUID()}`
      const conversation = new Conversation({ id })
      await conversation.save()
      return { success: true, data: conversation }
    } catch (error) {
      console.error('Create conversation error:', error)
      return { success: false, error: 'Failed to create conversation' }
    }
  }

  async publishConversation(id: string) {
    try {
      const conversation = await Conversation.findOne({ id });
      if (!conversation) {
        return { success: false, error: 'Conversation not found' };
      }
      // Get the verifiable presentation
      const result = await this.getConversationById(id);
      if (!result.success) {
        return { success: false, error: 'Failed to get conversation data' };
      }

      const { verifiablePresentation } = result.data as { verifiablePresentation: any };
      // Publish to Cheqd network
      const published = await this.didResourceService.publishResource(
        id,
        verifiablePresentation
      );

      if (!published) {
        return { success: false, error: 'Failed to publish to Cheqd network' };
      }

      // Update conversation with published status
      conversation.published = true;
      conversation.publishedAt = new Date();
      await conversation.save();

      return { 
        success: true, 
        data: conversation.toObject()
      };
    } catch (error) {
      console.error('Error publishing conversation:', error);
      return { success: false, error: 'Failed to publish conversation' };
    }
  }
} 