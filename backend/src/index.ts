import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { CONFIG } from './config';
import { credentialController } from './controllers/credentialController';
import { connectToDatabase } from './db';
import { chatController } from './controllers/chatController';
import { errorHandler } from './middleware/errorHandler';

await connectToDatabase();

const app = new Elysia()
  .use(cors({
    origin: CONFIG.CORS_ORIGINS || ['http://localhost:5173'],
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
