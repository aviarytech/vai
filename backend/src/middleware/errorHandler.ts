import { Elysia } from 'elysia';

export const errorHandler = new Elysia()
  .onError(({ code, error, set }) => {
    console.error(`Error [${code}]:`, error);
    
    switch (code) {
      case 'NOT_FOUND':
        set.status = 404;
        return { error: 'Resource not found' };
      
      case 'VALIDATION':
        set.status = 400;
        return { error: 'Invalid request data' };
      
      case 'PARSE':
        set.status = 400;
        return { error: 'Invalid request format' };
      
      default:
        set.status = 500;
        return { 
          error: process.env.NODE_ENV === 'production' 
            ? 'Internal server error' 
            : error.message 
        };
    }
  });
