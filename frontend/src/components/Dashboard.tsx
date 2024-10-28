import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { CONFIG } from '../config';

interface Credential {
  _id: string;
  modelInfo: {
    name: string;
    provider: string;
    version: string;
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

interface SearchFilters {
  modelName: string;
  provider: string;
  startDate: string;
  endDate: string;
  searchTerm: string;
}

interface BatchOperation {
  type: 'verify' | 'export' | 'delete';
  status: 'idle' | 'processing' | 'complete' | 'error';
  error?: string;
}

function Dashboard() {
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [, setLoading] = useState(true);
  const [, setError] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({
    modelName: '',
    provider: '',
    startDate: '',
    endDate: '',
    searchTerm: '',
  });
  const [selectedCredentials, setSelectedCredentials] = useState<string[]>([]);
  const [batchOperation, setBatchOperation] = useState<BatchOperation>({
    type: 'verify',
    status: 'idle'
  });

  useEffect(() => {
    const fetchCredentials = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
          if (value) queryParams.append(key, value);
        });
  
        const response = await fetch(`${CONFIG.API_BASE_URL}/credentials/search?${queryParams}`);
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Failed to fetch credentials' }));
          throw new Error(errorData.error || 'Failed to fetch credentials');
        }
        const data = await response.json();
        setCredentials(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load credentials');
      } finally {
        setLoading(false);
      }
    };
    fetchCredentials();
  }, [filters]);

  const handleFilterChange = (key: keyof SearchFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleBatchVerify = async () => {
    setBatchOperation({ type: 'verify', status: 'processing' });
    try {
      const results = await Promise.all(
        selectedCredentials.map(id =>
          fetch(`${CONFIG.API_BASE_URL}/credentials/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ credentialId: id })
          }).then(res => res.json())
        )
      );
      
      // Show results in a modal or notification
      console.log('Batch verification results:', results);
      setBatchOperation({ type: 'verify', status: 'complete' });
    } catch {
      setBatchOperation({
        type: 'verify',
        status: 'error',
        error: 'Failed to verify credentials'
      });
    }
  };

  const handleExport = () => {
    const selectedData = credentials
      .filter(cred => selectedCredentials.includes(cred._id))
      .map(cred => ({
        ...cred,
        verificationUrl: `${window.location.origin}/verify?id=${cred._id}`
      }));

    const blob = new Blob([JSON.stringify(selectedData, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `credentials-export-${format(new Date(), 'yyyy-MM-dd')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Search & Filter</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Model Name
            </label>
            <input
              type="text"
              value={filters.modelName}
              onChange={(e) => handleFilterChange('modelName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="e.g., GPT-4"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Provider
            </label>
            <input
              type="text"
              value={filters.provider}
              onChange={(e) => handleFilterChange('provider', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="e.g., OpenAI"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search Term
            </label>
            <input
              type="text"
              value={filters.searchTerm}
              onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Search in prompts and responses"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>

        {/* Batch operations */}
        {selectedCredentials.length > 0 && (
          <div className="bg-white shadow-sm rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">
                {selectedCredentials.length} credentials selected
              </span>
              <div className="space-x-2">
                <button
                  onClick={handleBatchVerify}
                  disabled={batchOperation.status === 'processing'}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
                >
                  {batchOperation.status === 'processing' ? 'Verifying...' : 'Verify Selected'}
                </button>
                <button
                  onClick={handleExport}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                >
                  Export Selected
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Existing table with added selection */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    onChange={e => {
                      setSelectedCredentials(
                        e.target.checked
                          ? credentials.map(c => c._id)
                          : []
                      );
                    }}
                    checked={selectedCredentials.length === credentials.length}
                    className="rounded border-gray-300"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Model
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Provider
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Prompt
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {credentials.map((credential) => (
                <tr key={credential._id}>
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedCredentials.includes(credential._id)}
                      onChange={e => {
                        setSelectedCredentials(prev =>
                          e.target.checked
                            ? [...prev, credential._id]
                            : prev.filter(id => id !== credential._id)
                        );
                      }}
                      className="rounded border-gray-300"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {credential.modelInfo.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      v{credential.modelInfo.version}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {credential.modelInfo.provider}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 truncate max-w-xs">
                      {credential.input.prompt}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {format(new Date(credential.input.timestamp), 'PPpp')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => window.location.href = `/verify?id=${credential._id}`}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      Verify
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Batch operation status */}
        {batchOperation.status === 'error' && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4">
            <p className="text-red-700">{batchOperation.error}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
