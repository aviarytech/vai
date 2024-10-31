import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { CONFIG } from './config';
import { credentialController } from './controllers/credentialController';
import { connectToDatabase } from './db';
import { chatController } from './controllers/chatController';
import { errorHandler } from './middleware/errorHandler';

// Parse CORS_ORIGINS string into an array
const corsOrigins = CONFIG.CORS_ORIGINS
  ? CONFIG.CORS_ORIGINS.split(',').map(origin => origin.trim())
  : ['http://localhost:5173'];

console.log('Configured CORS origins:', corsOrigins);

await connectToDatabase();

const app = new Elysia()
  .use(cors({
    origin: corsOrigins,  // Pass the array of origins directly
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    credentials: true,
    maxAge: 3600,
    preflight: true
  }))
  .onError(errorHandler)
  .use(credentialController)
  .use(chatController)
  .get('/', () => 'Hello, AI Credential Verifier!')
  .listen(CONFIG.PORT);

console.log(`Verifiable AI MVP - Backend is running at ${app.server?.hostname}:${app.server?.port}`);

const server = app.server;
export { app, server };
