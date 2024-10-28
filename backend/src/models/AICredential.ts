import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IAICredential extends Document {
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
}

const AICredentialSchema: Schema = new Schema({
  modelInfo: {
    name: { type: String, required: true },
    version: { type: String, required: true },
    provider: { type: String, required: true },
  },
  input: {
    prompt: { type: String, required: true },
    timestamp: { type: String, required: true },
  },
  output: {
    response: { type: String, required: true },
    timestamp: { type: String, required: true },
  },
}, { timestamps: true });

export function getAICredentialModel(): Model<IAICredential> {
  return mongoose.models.AICredential || mongoose.model<IAICredential>('AICredential', AICredentialSchema);
}
