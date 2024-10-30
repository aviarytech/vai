import mongoose, { Document, Schema } from 'mongoose';

// Base interface without Document properties
export interface IVerifiableCredential {
  id?: string;
  '@context': string[];
  type: string[];
  issuer: {
    id: string;
    name?: string;
  } | string;
  credentialSubject: {
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
  };
  issuanceDate: string;
  proof: {
    type: string;
    created: string;
    verificationMethod: string;
    proofPurpose: string;
    proofValue: string;
  };
}

// Omit Document's id to avoid conflict with VerifiableCredential's id
export interface AICredential extends Omit<Document, 'id'>, IVerifiableCredential {}

const aiCredentialSchema = new Schema<AICredential>(
  {
    id: { type: String, sparse: true },
    '@context': { type: [String], required: true },
    type: { type: [String], required: true },
    issuer: {
      type: Schema.Types.Mixed,  // Allow both string and object
      required: true
    },
    credentialSubject: new Schema({
      modelInfo: {
        name: { type: String, required: true },
        version: { type: String, required: true },
        provider: { type: String, required: true }
      },
      input: {
        prompt: { type: String, required: true },
        timestamp: { type: String, required: true }
      },
      output: {
        response: { type: String, required: true },
        timestamp: { type: String, required: true }
      }
    }, { _id: false }),  // Disable _id for nested document
    issuanceDate: { type: String, required: true },
    proof: {
      type: { type: String, required: true },
      created: { type: String, required: true },
      verificationMethod: { type: String, required: true },
      proofPurpose: { type: String, required: true },
      proofValue: { type: String, required: true }
    }
  },
  { 
    timestamps: true,
    toJSON: { getters: true },
    id: false
  }
);

// Only export the getter function
export const getAICredentialModel = () => {
  try {
    return mongoose.model<AICredential>('AICredential');
  } catch {
    return mongoose.model<AICredential>('AICredential', aiCredentialSchema);
  }
};
