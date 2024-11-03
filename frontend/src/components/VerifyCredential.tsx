import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CONFIG } from '../config';
import { IVerifiableCredential } from '../../../backend/src/models/AICredential';

interface ConversationContext {
  currentCredential: IVerifiableCredential;
  previousCredentials: IVerifiableCredential[];
}

function VerifyCredential() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchParams] = useSearchParams();
  const [context, setContext] = useState<ConversationContext | null>(null);

  useEffect(() => {
    const credentialId = searchParams.get('id');
    if (credentialId) {
      fetchCredentialContext(credentialId);
    }
  }, [searchParams]);

  const fetchCredentialContext = async (id: string) => {
    setLoading(true);
    try {
      const response = await fetch(`${CONFIG.API_BASE_URL}/credentials/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch credential context');
      }
      const contextData = await response.json();
      setContext(contextData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch context');
    } finally {
      setLoading(false);
    }
  };

  const renderContext = () => {
    if (!context) return null;

    return (
      <div className="mt-8 space-y-4">
        {context.previousCredentials.map((vc, index) => (
          <div key={index} className="space-y-4">
            {/* User message */}
            <div className="flex justify-end">
              <div className="max-w-[80%] bg-blue-500 text-white rounded-lg p-4">
                <p>{vc.credentialSubject.input.prompt}</p>
                <p className="text-xs opacity-75 mt-1">
                  {new Date(vc.credentialSubject.input.timestamp).toLocaleString()}
                </p>
              </div>
            </div>
            
            {/* Assistant message */}
            <div className="flex justify-start">
              <div className="max-w-[80%] bg-gray-100 rounded-lg p-4">
                <p className="text-xs text-gray-500 mb-2">
                  {vc.credentialSubject.modelInfo.name}
                </p>
                <p>{vc.credentialSubject.output.response}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(vc.credentialSubject.output.timestamp).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        ))}

        {/* Current messages */}
        <div className="space-y-4">
          {/* Current user message */}
          <div className="flex justify-end">
            <div className="max-w-[80%] bg-blue-500 text-white rounded-lg p-4">
              <p>{context.currentCredential.credentialSubject.input.prompt}</p>
              <p className="text-xs opacity-75 mt-1">
                {new Date(context.currentCredential.credentialSubject.input.timestamp).toLocaleString()}
              </p>
            </div>
          </div>
          
          {/* Current assistant message */}
          <div className="flex justify-start">
            <div className="max-w-[80%] bg-gray-100 rounded-lg p-4 border-2 border-blue-500">
              <p className="text-xs text-gray-500 mb-2">
                {context.currentCredential.credentialSubject.modelInfo.name}
              </p>
              <p>{context.currentCredential.credentialSubject.output.response}</p>
              <p className="text-xs text-gray-500 mt-1">
                {new Date(context.currentCredential.credentialSubject.output.timestamp).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}
      
      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading conversation...</p>
        </div>
      )}
      
      {context && renderContext()}
    </div>
  );
}

export default VerifyCredential;
