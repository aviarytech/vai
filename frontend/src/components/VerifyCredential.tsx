import { useState } from 'react';

interface VerificationResult {
  isValid: boolean;
  details: {
    modelVerified: boolean;
    timestampVerified: boolean;
    inputOutputMatch: boolean;
  };
  error?: string;
}

interface AICredential {
  modelInfo: {
    name: string;
    version: string;
    provider: string;
  };
  input: {
    prompt: string;
    timestamp: string;
  };
  output: {
    response: string;
    timestamp: string;
  };
}

function VerifyCredential() {
  const [credentialId, setCredentialId] = useState('');
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [, setJsonFile] = useState<File | null>(null);
  const [credential, setCredential] = useState<AICredential | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setVerificationResult(null);

    try {
      const response = await fetch('/api/credentials/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentialId ? { credentialId } : credential),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Verification failed');
      }

      const result = await response.json();
      setVerificationResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to verify credential');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setJsonFile(file);
      try {
        const text = await file.text();
        const json = JSON.parse(text);
        setCredential(json);
        setCredentialId(''); // Clear ID when file is uploaded
      } catch {
        setError('Invalid JSON file');
        setCredential(null);
      }
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Verify AI Credential</h1>
      
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-4">Choose Verification Method</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Verify by Credential ID
              </label>
              <input
                type="text"
                value={credentialId}
                onChange={(e) => {
                  setCredentialId(e.target.value);
                  setCredential(null);
                  setJsonFile(null);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter credential ID"
                disabled={!!credential}
              />
            </div>
            
            <div className="border-t pt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Or Upload Credential JSON
              </label>
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="w-full"
                disabled={!!credentialId}
              />
            </div>
          </div>
        </div>

        {credential && (
          <div className="mb-4 p-4 bg-gray-50 rounded-md">
            <h3 className="font-medium mb-2">Uploaded Credential Preview:</h3>
            <pre className="text-sm overflow-auto max-h-40">
              {JSON.stringify(credential, null, 2)}
            </pre>
          </div>
        )}
        
        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading || (!credentialId && !credential)}
          className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {loading ? 'Verifying...' : 'Verify Credential'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {verificationResult && (
        <div className={`bg-${verificationResult.isValid ? 'green' : 'yellow'}-50 border-l-4 border-${verificationResult.isValid ? 'green' : 'yellow'}-400 p-4`}>
          <h2 className="text-lg font-semibold mb-2">
            Verification Result: {verificationResult.isValid ? 'Valid' : 'Invalid'}
          </h2>
          <ul className="space-y-2">
            <li className="flex items-center">
              <span className={`mr-2 ${verificationResult.details.modelVerified ? 'text-green-600' : 'text-red-600'}`}>
                {verificationResult.details.modelVerified ? '✓' : '✗'}
              </span>
              <div>
                <span className="font-medium">Model Information</span>
                <p className="text-sm text-gray-600">
                  {verificationResult.details.modelVerified 
                    ? 'Valid model information provided' 
                    : 'Missing or invalid model information'}
                </p>
              </div>
            </li>
            <li className="flex items-center">
              <span className={`mr-2 ${verificationResult.details.timestampVerified ? 'text-green-600' : 'text-red-600'}`}>
                {verificationResult.details.timestampVerified ? '✓' : '✗'}
              </span>
              <div>
                <span className="font-medium">Timestamp Verification</span>
                <p className="text-sm text-gray-600">
                  {verificationResult.details.timestampVerified 
                    ? 'Input timestamp precedes output timestamp' 
                    : 'Invalid timestamp sequence'}
                </p>
              </div>
            </li>
            <li className="flex items-center">
              <span className={`mr-2 ${verificationResult.details.inputOutputMatch ? 'text-green-600' : 'text-red-600'}`}>
                {verificationResult.details.inputOutputMatch ? '✓' : '✗'}
              </span>
              <div>
                <span className="font-medium">Input/Output Consistency</span>
                <p className="text-sm text-gray-600">
                  {verificationResult.details.inputOutputMatch 
                    ? 'Valid input/output pair' 
                    : 'Missing or invalid input/output data'}
                </p>
              </div>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}

export default VerifyCredential;
