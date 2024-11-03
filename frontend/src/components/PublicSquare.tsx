import { useState, useEffect, useCallback, useRef } from 'react';
import { CONFIG } from '../config';
import { IVerifiableCredential } from '../../../backend/src/models/AICredential';

interface IVerifiablePresentation {
  "@context": string[];
  type: string[];
  verifiableCredential: IVerifiableCredential[];
}

export function PublicSquare() {
  const [conversations, setConversations] = useState<IVerifiablePresentation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedConversation, setSelectedConversation] = useState<IVerifiablePresentation | null>(null);
  const hasFetched = useRef(false);

  const fetchPublishedConversations = useCallback(async () => {
    if (hasFetched.current) return;
    console.log('Fetching published conversations...');
    try {
      const response = await fetch(`${CONFIG.API_BASE_URL}/conversations/published`);
      if (!response.ok) {
        throw new Error('Failed to fetch published conversations');
      }
      const data = await response.json();
      if (data.success) {
        setConversations(data.resources);
      } else {
        throw new Error(data.error || 'Failed to fetch conversations');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
      hasFetched.current = true;
    }
  }, []);

  useEffect(() => {
    fetchPublishedConversations();
  }, [fetchPublishedConversations]);

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

  return (
    <div className="max-w-7xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Public Square</h1>
      
      <div className="grid md:grid-cols-2 gap-4">
        {/* List of published conversations */}
        <div className="space-y-4">
          {conversations.map((conversation, index) => {
            const firstMessage = conversation.verifiableCredential[0]?.credentialSubject.input.prompt;
            const timestamp = conversation.verifiableCredential[0]?.credentialSubject.input.timestamp;
            const messageCount = conversation.verifiableCredential.length;

            return (
              <div 
                key={index}
                className={`p-4 border rounded-lg cursor-pointer hover:bg-gray-50 ${selectedConversation === conversation ? 'border-blue-500' : ''}`}
                onClick={() => setSelectedConversation(conversation)}
              >
                <h3 className="font-semibold line-clamp-2">{firstMessage}</h3>
                <div className="flex gap-2 text-sm text-gray-500 mt-1">
                  <span>{new Date(timestamp).toLocaleDateString()}</span>
                  <span>•</span>
                  <span>{messageCount} messages</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Conversation details */}
        {selectedConversation && (
          <div className="border rounded-lg p-4 h-[calc(100vh-12rem)] overflow-y-auto sticky top-20">
            <h2 className="text-xl font-semibold mb-4">Conversation</h2>
            <div className="space-y-4">
              {selectedConversation.verifiableCredential.map((vc, index) => (
                <div key={index} className="border-b pb-4">
                  <div className="bg-gray-100 p-3 rounded-lg mb-2">
                    <div className="flex justify-between items-start mb-1">
                      <p className="font-medium">User</p>
                      <span className="text-xs text-gray-500">
                        {new Date(vc.credentialSubject.input.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="whitespace-pre-wrap">{vc.credentialSubject.input.prompt}</p>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="flex justify-between items-start mb-1">
                      <p className="font-medium">Assistant</p>
                      <span className="text-xs text-gray-500">
                        {new Date(vc.credentialSubject.output.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="whitespace-pre-wrap">{vc.credentialSubject.output.response}</p>
                    {vc.credentialSubject.modelInfo && (
                      <div className="mt-2 text-xs text-gray-500">
                        Model: {vc.credentialSubject.modelInfo.version}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 