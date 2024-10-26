import { Schema, model } from 'mongoose';

interface AICredential {
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

const aiCredentialSchema = new Schema<AICredential>({
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
});

export const AICredentialModel = model<AICredential>('AICredential', aiCredentialSchema);