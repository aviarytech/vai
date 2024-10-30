import { getAICredentialModel } from '../models/AICredential';

export interface SearchParams {
  modelName?: string;
  provider?: string;
  startDate?: string;
  endDate?: string;
  searchTerm?: string;
}

export class SearchService {
  static async searchCredentials(params: SearchParams) {
    const AICredential = getAICredentialModel();
    const query: any = {};
    if (params.modelName) {
      query['credentialSubject.modelInfo.name'] = { $regex: params.modelName, $options: 'i' };
    }

    if (params.provider) {
      query['credentialSubject.modelInfo.provider'] = { $regex: params.provider, $options: 'i' };
    }

    if (params.startDate || params.endDate) {
      query['credentialSubject.input.timestamp'] = {};
      if (params.startDate) {
        query['credentialSubject.input.timestamp'].$gte = params.startDate;
      }
      if (params.endDate) {
        query['credentialSubject.input.timestamp'].$lte = params.endDate;
      }
    }

    if (params.searchTerm) {
      query.$or = [
        { 'credentialSubject.input.prompt': { $regex: params.searchTerm, $options: 'i' } },
        { 'credentialSubject.output.response': { $regex: params.searchTerm, $options: 'i' } }
      ];
    }

    const results = await AICredential.find(query)
      .sort({ 'credentialSubject.input.timestamp': -1 })
      .limit(100);
    
    return results;
  }
}
