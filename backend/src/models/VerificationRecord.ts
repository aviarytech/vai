import mongoose, { Document, Schema } from 'mongoose';

export interface IVerificationRecord extends Document {
  credentialId: string;
  timestamp: string;
  result: {
    isValid: boolean;
    details: {
      modelVerified: boolean;
      timestampVerified: boolean;
      inputOutputMatch: boolean;
    };
  };
}

const VerificationRecordSchema = new Schema({
  credentialId: { type: String, required: true },
  timestamp: { type: String, required: true },
  result: {
    isValid: { type: Boolean, required: true },
    details: {
      modelVerified: { type: Boolean, required: true },
      timestampVerified: { type: Boolean, required: true },
      inputOutputMatch: { type: Boolean, required: true },
    },
  },
}, { timestamps: true });

export const VerificationRecord = mongoose.model<IVerificationRecord>('VerificationRecord', VerificationRecordSchema);
