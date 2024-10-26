import { useState } from 'react';

interface Credential {
  id: string;
  modelName: string;
  provider: string;
  timestamp: string;
}

function Dashboard() {
  const [credentials] = useState<Credential[]>([
    { id: '1', modelName: 'GPT-4', provider: 'OpenAI', timestamp: '2024-03-15T10:30:00Z' },
    { id: '2', modelName: 'Claude', provider: 'Anthropic', timestamp: '2024-03-14T14:45:00Z' },
  ]);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">AI Credentials Dashboard</h1>
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-neutral-200">
          <thead className="bg-neutral-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Model</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Provider</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Timestamp</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-neutral-200">
            {credentials.map((credential) => (
              <tr key={credential.id}>
                <td className="px-6 py-4 whitespace-nowrap">{credential.modelName}</td>
                <td className="px-6 py-4 whitespace-nowrap">{credential.provider}</td>
                <td className="px-6 py-4 whitespace-nowrap">{new Date(credential.timestamp).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Dashboard;
