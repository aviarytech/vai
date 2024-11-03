import { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { CONFIG } from '../config';
import { VerificationBadge } from './VerificationBadge';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  credentialId?: string;
  issuerName: string;
  timestamp: string;
}

interface VerifiableCredential {
  id: string;
  issuer: {
    name: string;
  } | string;
  credentialSubject: {
    input?: {
      prompt: string;
      timestamp: string;
    };
    output?: {
      response: string;
      timestamp: string;
    };
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
  const [isPublishing, setIsPublishing] = useState(false);
  const [, setPublishError] = useState<string | null>(null);

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
          const loadedMessages: Message[] = [];
          
          // Process each credential and create both user and assistant messages
          data.data.verifiablePresentation.verifiableCredential.forEach(
            (vc: VerifiableCredential) => {
              if (vc.credentialSubject.input) {
                loadedMessages.push({
                  role: 'user',
                  content: vc.credentialSubject.input.prompt,
                  credentialId: vc.id,
                  issuerName: typeof vc.issuer === 'string' ? vc.issuer : vc.issuer.name,
                  timestamp: vc.credentialSubject.input.timestamp
                });
              }
              if (vc.credentialSubject.output) {
                loadedMessages.push({
                  role: 'assistant',
                  content: vc.credentialSubject.output.response,
                  credentialId: vc.id,
                  issuerName: typeof vc.issuer === 'string' ? vc.issuer : vc.issuer.name,
                  timestamp: vc.credentialSubject.output.timestamp
                });
              }
            }
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
      issuerName: 'TBD',
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
        issuerName: 'TBD',
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Failed to get response:', error);
      // Add error message to UI
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: error instanceof Error ? error.message : 'An error occurred',
        timestamp: new Date().toISOString(),
        issuerName: 'N/A'
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

  const handlePublish = async () => {
    if (!conversationId) return;
    
    setIsPublishing(true);
    setPublishError(null);
    
    try {
      const response = await fetch(`${CONFIG.API_BASE_URL}/conversations/${conversationId}/publish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to publish conversation');
      }

      const data = await response.json();
      if (data.success) {
        // Show success message
        alert('Conversation published successfully!');
      }
    } catch (error) {
      console.error('Error publishing conversation:', error);
      setPublishError('Failed to publish conversation');
    } finally {
      setIsPublishing(false);
    }
  };

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
              <div className="flex items-start gap-2">
                <div className="relative w-full">
                  <p>{message.content}</p>
                </div>
              </div>
              {message.credentialId && message.role === 'assistant' && (
                <div className="mt-2 text-xs opacity-75 flex gap-2 justify-end items-center">
                  <a
                    href={`/verify?id=${message.credentialId}`}
                    className="underline"
                  >
                    See Context
                  </a>
                  {message.credentialId && message.role === 'assistant' && (
                    <div className="">
                      <VerificationBadge issuer={message.issuerName} />
                    </div>
                  )}
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
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Are you sure you want to publish this conversation? This action cannot be undone.')) {
                  handlePublish();
                }
              }}
              disabled={isPublishing}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-5 w-5" 
                viewBox="0 0 20 20" 
                fill="currentColor"
              >
                <path 
                  fillRule="evenodd" 
                  d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" 
                  clipRule="evenodd" 
                />
              </svg>
              {isPublishing ? 'Publishing...' : 'Publish'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ChatInterface;
