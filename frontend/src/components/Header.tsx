import { Link, useNavigate } from 'react-router-dom'
import { CONFIG } from '../config'

export function Header() {
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
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-white z-50 border-b shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-xl font-bold">VAI</Link>
          <div className="flex gap-4">
            <Link 
              to="/conversations" 
              className="p-2 text-blue-500 hover:text-blue-600"
              title="Previous Conversations"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="currentColor" 
                className="w-6 h-6"
              >
                <path 
                  fillRule="evenodd" 
                  d="M2.625 6.75a1.125 1.125 0 1 1 2.25 0 1.125 1.125 0 0 1-2.25 0Zm4.875 0A.75.75 0 0 1 8.25 6h12a.75.75 0 0 1 0 1.5h-12a.75.75 0 0 1-.75-.75ZM2.625 12a1.125 1.125 0 1 1 2.25 0 1.125 1.125 0 0 1-2.25 0ZM7.5 12a.75.75 0 0 1 .75-.75h12a.75.75 0 0 1 0 1.5h-12A.75.75 0 0 1 7.5 12Zm-4.875 5.25a1.125 1.125 0 1 1 2.25 0 1.125 1.125 0 0 1-2.25 0Zm4.875 0a.75.75 0 0 1 .75-.75h12a.75.75 0 0 1 0 1.5h-12a.75.75 0 0 1-.75-.75Z" 
                  clipRule="evenodd" 
                />
              </svg>
            </Link>
            <button 
              onClick={handleNewChat}
              className="p-2 text-blue-500 hover:text-blue-600"
              title="New Chat"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="currentColor" 
                className="w-6 h-6"
              >
                <path 
                  fillRule="evenodd" 
                  d="M12 3.75a.75.75 0 0 1 .75.75v6.75h6.75a.75.75 0 0 1 0 1.5h-6.75v6.75a.75.75 0 0 1-1.5 0v-6.75H4.5a.75.75 0 0 1 0-1.5h6.75V4.5a.75.75 0 0 1 .75-.75Z" 
                  clipRule="evenodd" 
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
} 