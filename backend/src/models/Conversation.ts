import mongoose, { Document } from 'mongoose';

export interface ConversationWithVP extends IConversation {
  verifiablePresentation: any;
}

export interface IConversation extends Document {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  published: boolean;
  publishedAt: Date | null;
  publishedUrl: string | null;
}

const ConversationSchema = new mongoose.Schema({
  id: { 
    type: String, 
    required: true, 
    unique: true,
    index: true 
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  published: {
    type: Boolean,
    default: false
  },
  publishedAt: {
    type: Date,
    default: null
  },
  publishedUrl: {
    type: String,
    default: null
  }
});

export const Conversation = mongoose.model<IConversation>('Conversation', ConversationSchema);
export default Conversation; 