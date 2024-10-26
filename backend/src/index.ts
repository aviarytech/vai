import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { CONFIG } from './config';

export const app = new Elysia()
  .use(cors())
  .get('/', () => 'Hello, AI Credential Verifier!')
  .listen(CONFIG.PORT);

console.log(`Verifiable AI MVP - Backend is running at ${app.server?.hostname}:${app.server?.port}`);
