export const CONFIG = {
  PORT: process.env.PORT || 3000,
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/ai_credential_verifier',
  CORS_ORIGINS: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:5173', 'http://127.0.0.1:5173'],
  AI_SERVICE: {
    PROVIDER: process.env.AI_PROVIDER || 'CLAUDE', // or 'OPENAI'
    API_KEY: process.env.AI_API_KEY || '',
    MODEL: process.env.AI_MODEL || 'claude-3-sonnet-20240229',
  }
};
