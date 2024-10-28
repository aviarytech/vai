import { useState, useEffect } from 'react';

interface VerificationRecord {
  id: string;
  timestamp: string;
  credentialId: string;
  result: {
    isValid: boolean;
    details: {
      modelVerified: boolean;
      timestampVerified: boolean;
      inputOutputMatch: boolean;
    };
  };
}

function VerificationHistory() {
  const [history, setHistory] = useState<VerificationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchVerificationHistory();
  }, []);

  const fetchVerificationHistory = async () => {
    try {
      const response = await fetch('/api/credentials/verify/history');
      if (!response.ok) {
        throw new Error('Failed to fetch verification history');
      }
      const data = await response.json();
      setHistory(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4">
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg font-medium leading-6 text-gray-900">Verification History</h3>
        <p className="mt-1 text-sm text-gray-500">Recent credential verification attempts</p>
      </div>
      <div className="border-t border-gray-200">
        <ul className="divide-y divide-gray-200">
          {history.map((record) => (
            <li key={record.id} className="px-4 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Credential ID: {record.credentialId}
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(record.timestamp).toLocaleString()}
                  </p>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  record.result.isValid 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {record.result.isValid ? 'Valid' : 'Invalid'}
                </div>
              </div>
              <div className="mt-2 grid grid-cols-3 gap-4 text-sm">
                <div className={`flex items-center ${
                  record.result.details.modelVerified ? 'text-green-600' : 'text-red-600'
                }`}>
                  <span className="mr-1">
                    {record.result.details.modelVerified ? '✓' : '✗'}
                  </span>
                  Model Info
                </div>
                <div className={`flex items-center ${
                  record.result.details.timestampVerified ? 'text-green-600' : 'text-red-600'
                }`}>
                  <span className="mr-1">
                    {record.result.details.timestampVerified ? '✓' : '✗'}
                  </span>
                  Timestamps
                </div>
                <div className={`flex items-center ${
                  record.result.details.inputOutputMatch ? 'text-green-600' : 'text-red-600'
                }`}>
                  <span className="mr-1">
                    {record.result.details.inputOutputMatch ? '✓' : '✗'}
                  </span>
                  I/O Match
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default VerificationHistory;
