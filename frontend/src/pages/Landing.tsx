import { Link, useNavigate } from 'react-router-dom';
import { CONFIG } from '../config';

export function Landing() {
  const navigate = useNavigate();

  const handleNewChat = async () => {
    try {
      const response = await fetch(`${CONFIG.API_BASE_URL}/conversations`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Failed to create conversation');
      }

      const data = await response.json();
      if (data.success && data.data.id) {
        navigate(`/chat/${data.data.id}`);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
      // Could add error handling UI here
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Welcome to AI Chat</h1>
          <p className="text-gray-600 mb-8">Choose an option to get started</p>
        </div>
        
        <div className="space-y-4">
          <button
            onClick={handleNewChat}
            className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10"
          >
            Start New Conversation
          </button>
          
          <Link
            to="/conversations"
            className="w-full flex items-center justify-center px-8 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10"
          >
            View Previous Conversations
          </Link>
        </div>
      </div>
    </div>
  );
} 