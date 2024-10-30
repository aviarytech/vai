import { useState, useRef, FormEvent } from 'react';
import { CONFIG } from '../config';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  credentialId?: string; // Reference to the credential created for this message
  timestamp: string;
}

function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: FormEvent) => {
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
      // 1. Get AI response
      const aiResponse = await fetch(`${CONFIG.API_BASE_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: inputMessage })
      });
      
      const { response, credentialId } = await aiResponse.json();

      // 2. Add assistant message with credential reference
      const assistantMessage: Message = {
        role: 'assistant',
        content: response,
        credentialId,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Failed to get response:', error);
      // Handle error appropriately
    } finally {
      setIsLoading(false);
      // Restore focus to input after loading completes
      inputRef.current?.focus();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)]"> {/* Subtract navbar height */}
      {/* Messages container with single scroll area */}
      <div className="flex-1 relative">
        <div className="absolute inset-0 overflow-y-auto">
          <div className="max-w-4xl mx-auto p-4 space-y-4">
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
        </div>
      </div>

      {/* Input area */}
      <div className="bg-white border-t">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto p-4">
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
              autoFocus
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
