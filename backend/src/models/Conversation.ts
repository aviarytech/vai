import { Schema, model } from 'mongoose'

export interface IConversation {
  _id?: string
  id: string
  createdAt: Date
  updatedAt: Date
}

export interface ConversationWithVP extends IConversation {
  verifiablePresentation: {
    "@context": string[]
    type: string[]
    verifiableCredential: any[]
  }
}

const conversationSchema = new Schema<IConversation>({
  id: { 
    type: String, 
    required: true, 
    unique: true,
    index: true 
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
})

export const Conversation = model<IConversation>('Conversation', conversationSchema) 