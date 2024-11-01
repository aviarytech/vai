import { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { CONFIG } from '../config';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  credentialId?: string;
  timestamp: string;
}

interface VerifiableCredential {
  credentialSubject: {
    role: 'user' | 'assistant';
    message: string;
    timestamp: string;
    id: string;
  }
}

function ChatInterface() {
  const { id: conversationId } = useParams<{ id: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [shouldFocus, setShouldFocus] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loadConversation = async () => {
      if (!conversationId) return;

      try {
        const response = await fetch(`${CONFIG.API_BASE_URL}/conversations/${conversationId}`);
        if (!response.ok) {
          throw new Error('Failed to load conversation');
        }

        const data = await response.json();
        if (data.success && data.data.verifiablePresentation) {
          const loadedMessages = data.data.verifiablePresentation.verifiableCredential.map(
            (vc: VerifiableCredential) => ({
              role: vc.credentialSubject.role,
              content: vc.credentialSubject.message,
              credentialId: vc.credentialSubject.id,
              timestamp: vc.credentialSubject.timestamp
            })
          );
          setMessages(loadedMessages);
        }
      } catch (error) {
        console.error('Error loading conversation:', error);
      }
    };

    loadConversation();
  }, [conversationId]);

  // Use a single effect for focus management
  useEffect(() => {
    if (shouldFocus && inputRef.current && !isLoading) {
      inputRef.current.focus();
      setShouldFocus(false);
    }
  }, [shouldFocus, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Send message to backend
      const response = await fetch(`${CONFIG.API_BASE_URL}/chat`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          prompt: inputMessage,
          conversationId
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get response');
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to get response');
      }

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.response,
        credentialId: data.credentialId,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Failed to get response:', error);
      // Add error message to UI
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: error instanceof Error ? error.message : 'An error occurred',
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setIsLoading(false);
      setShouldFocus(true); // Request focus after completion
    }
  };

  // Request focus when component mounts
  useEffect(() => {
    setShouldFocus(true);
  }, []);

  return (
    <div className="relative h-full min-h-screen pb-24">
      <div className="max-w-4xl mx-auto p-4 space-y-4 mb-24">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-4 ${
                message.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              <p>{message.content}</p>
              {message.credentialId && (
                <div className="mt-2 text-xs opacity-75">
                  <a
                    href={`/verify?id=${message.credentialId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    Verify Response
                  </a>
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg p-4">
              <div className="animate-pulse">Thinking...</div>
            </div>
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto p-4">
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onBlur={() => setShouldFocus(true)}
              placeholder="Type your message..."
              className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ChatInterface;
