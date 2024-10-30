import { Elysia, t } from 'elysia';
import { getAICredentialModel } from '../models/AICredential';
import { VerificationService } from '../services/verificationService';
import { VerificationRecord } from '../models/VerificationRecord';
import { SearchService, SearchParams } from '../services/searchService';

// Add this type definition at the top of the file
type VerifiableCredential = {
  '@context': string[];
  type: string[];
  issuer: string | { id: string; name?: string };
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
};

export const credentialController = new Elysia({ prefix: '/api' })
  .post('/credentials', async ({ body, set }) => {
    const vc = body as VerifiableCredential;
    const AICredential = getAICredentialModel();

    if (!vc.credentialSubject?.modelInfo?.name || 
        !vc.credentialSubject?.input?.prompt || 
        !vc.credentialSubject?.output?.response) {
      set.status = 400;
      return { error: 'Required fields missing in Verifiable Credential' };
    }

    try {
      const credential = new AICredential(vc);

      await credential.save();

      set.status = 201;
      return credential;
    } catch (error) {
      console.error('Error creating credential:', error);
      set.status = 500;
      return { error: 'Internal server error' };
    }
  }, {
    body: t.Object({
      '@context': t.Array(t.String()),
      type: t.Array(t.String()),
      issuer: t.Union([
        t.String(),
        t.Object({
          id: t.String(),
          name: t.Optional(t.String())
        })
      ]),
      credentialSubject: t.Object({
        modelInfo: t.Object({
          name: t.String(),
          version: t.String(),
          provider: t.String()
        }),
        input: t.Object({
          prompt: t.String(),
          timestamp: t.String()
        }),
        output: t.Object({
          response: t.String(),
          timestamp: t.String()
        })
      }),
      issuanceDate: t.String(),
      proof: t.Object({
        type: t.String(),
        created: t.String(),
        verificationMethod: t.String(),
        proofPurpose: t.String(),
        proofValue: t.String()
      })
    })
  })
  .get('/credentials', async ({ set }) => {
    const AICredential = getAICredentialModel();
    try {
      const credentials = await AICredential.find().sort({ 'input.timestamp': -1 });
      return credentials;
    } catch (error) {
      console.error('Error fetching credentials:', error);
      set.status = 500;
      return { error: 'Internal server error' };
    }
  })
  .get('/credentials/verify/history', async ({ set }) => {
    try {
      const records = await VerificationRecord
        .find()
        .sort({ createdAt: -1 })
        .limit(50);
      return records;
    } catch (error) {
      console.error('Error fetching verification history:', error);
      set.status = 500;
      return { error: 'Internal server error' };
    }
  })
  .post('/credentials/verify', async ({ body, set }) => {
    const AICredential = getAICredentialModel();
    
    try {
      let verificationResult;
      let credentialId;

      if ('credentialId' in body) {
        const credential = await AICredential.findById(body.credentialId);
        if (!credential) {
          set.status = 404;
          return { error: 'Credential not found' };
        }
        credentialId = body.credentialId;
        verificationResult = await VerificationService.verifyCredential(credential);
      } else {
        // Handle direct verification of credential data
        verificationResult = await VerificationService.verifyCredential(body);
        credentialId = 'uploaded-credential';
      }

      // Store verification record
      await new VerificationRecord({
        credentialId,
        timestamp: new Date().toISOString(),
        result: verificationResult,
      }).save();

      return verificationResult;
    } catch (error) {
      console.error('Error verifying credential:', error);
      set.status = 500;
      return { error: 'Internal server error' };
    }
  }, {
    body: t.Union([
      // Option 1: Verify by credentialId
      t.Object({
        credentialId: t.String()
      }),
      // Option 2: Verify full verifiable credential
      t.Object({
        '@context': t.Array(t.String()),
        type: t.Array(t.String()),
        issuer: t.Union([
          t.String(),
          t.Object({
            id: t.String(),
            name: t.Optional(t.String())
          })
        ]),
        credentialSubject: t.Object({
          modelInfo: t.Object({
            name: t.String(),
            version: t.String(),
            provider: t.String()
          }),
          input: t.Object({
            prompt: t.String(),
            timestamp: t.String()
          }),
          output: t.Object({
            response: t.String(),
            timestamp: t.String()
          })
        }),
        issuanceDate: t.String(),
        proof: t.Object({
          type: t.String(),
          created: t.String(),
          verificationMethod: t.String(),
          proofPurpose: t.String(),
          proofValue: t.String()
        })
      })
    ])
  })
  .get('/credentials/search', async ({ query, set }) => {
    try {

      const searchParams: SearchParams = {
        modelName: query.modelName as string || undefined,
        provider: query.provider as string || undefined,
        startDate: query.startDate as string || undefined,
        endDate: query.endDate as string || undefined,
        searchTerm: query.searchTerm as string || undefined,
      };

      // Remove undefined values
      Object.keys(searchParams).forEach(key => {
        if (searchParams[key as keyof SearchParams] === undefined) {
          delete searchParams[key as keyof SearchParams];
        }
      });

      const results = await SearchService.searchCredentials(searchParams);
      
      if (results.length === 0) {
        console.log('No results found for query');
      }

      return results;
    } catch (error) {
      console.error('Error searching credentials:', error);
      set.status = 500;
      return { error: 'Internal server error' };
    }
  }, {
    query: t.Object({
      modelName: t.Optional(t.String()),
      provider: t.Optional(t.String()),
      startDate: t.Optional(t.String()),
      endDate: t.Optional(t.String()),
      searchTerm: t.Optional(t.String()),
    })
  })
  .get('/credentials/debug', async ({ set }) => {
    try {
      const AICredential = getAICredentialModel();
      const count = await AICredential.countDocuments();
      const sample = await AICredential.findOne();
      return {
        count,
        sample,
      };
    } catch (error) {
      console.error('Error in debug endpoint:', error);
      set.status = 500;
      return { error: 'Internal server error' };
    }
  });
