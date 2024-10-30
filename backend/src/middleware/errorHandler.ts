export const errorHandler = ({ code, error, set }: { code: string, error: Error, set: any }) => {
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
};
