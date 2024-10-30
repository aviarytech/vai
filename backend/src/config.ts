export const CONFIG = {
  PORT: process.env.PORT ? parseInt(process.env.PORT) : 3000,
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/ai_credential_verifier',
  CORS_ORIGINS: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:5173'],
  AI_SERVICE: {
    PROVIDER: process.env.AI_PROVIDER || 'CLAUDE',
    MODEL: process.env.AI_MODEL || 'claude-3-sonnet-20240229',
    API_KEY: process.env.AI_API_KEY,
    MOCK_RESPONSES: process.env.MOCK_AI_RESPONSES === 'true'
  },
  ACES_API_URL: process.env.ACES_API_URL || 'http://localhost:5151/api',
  ACES_API_KEY: process.env.ACES_API_KEY,
  ACES_TEMPLATE_ID: process.env.ACES_TEMPLATE_ID || 'ai-interaction-credential'
};
