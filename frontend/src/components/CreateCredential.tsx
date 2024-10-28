import React, { useState } from 'react';

interface CreateCredentialProps {
  onCredentialCreated: () => void;
}

const CreateCredential: React.FC<CreateCredentialProps> = ({ onCredentialCreated }) => {
  const [modelInfo, setModelInfo] = useState({
    name: '',
    version: '',
    provider: ''
  });
  const [input, setInput] = useState({
    prompt: '',
    timestamp: ''
  });
  const [output, setOutput] = useState({
    response: '',
    timestamp: ''
  });
  const [error, setError] = useState('');

  const generateRandomData = () => {
    const models = ['GPT-4', 'DALL-E', 'Stable Diffusion', 'Claude'];
    const providers = ['OpenAI', 'Anthropic', 'Stability AI', 'Google'];
    const prompts = ['Explain quantum computing', 'Generate an image of a futuristic city', 'Summarize the history of AI'];

    setModelInfo({
      name: models[Math.floor(Math.random() * models.length)],
      version: `v${Math.floor(Math.random() * 5) + 1}.${Math.floor(Math.random() * 10)}`,
      provider: providers[Math.floor(Math.random() * providers.length)]
    });

    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60000);

    setInput({
      prompt: prompts[Math.floor(Math.random() * prompts.length)],
      timestamp: fiveMinutesAgo.toISOString()
    });

    setOutput({
      response: 'This is a randomly generated response to the prompt.',
      timestamp: now.toISOString()
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!modelInfo.name || !input.prompt || !output.response) {
      setError('All fields are required');
      return;
    }

    try {
      const response = await fetch('/api/credentials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ modelInfo, input, output }),
      });

      if (response.ok) {
        generateRandomData(); // Reset with new random data
        onCredentialCreated();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to create credential. Please try again.');
      }
    } catch (err) {
      setError('Failed to create credential. Please try again.');
      console.error('Error creating credential:', err);
    }
  };

  // Generate random data on component mount
  React.useEffect(() => {
    generateRandomData();
  }, []);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <h3 className="text-lg font-medium text-gray-900">Model Information</h3>
        <div className="mt-2 grid grid-cols-3 gap-4">
          <input
            type="text"
            value={modelInfo.name}
            onChange={(e) => setModelInfo({...modelInfo, name: e.target.value})}
            placeholder="Model Name"
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
          <input
            type="text"
            value={modelInfo.version}
            onChange={(e) => setModelInfo({...modelInfo, version: e.target.value})}
            placeholder="Version"
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
          <input
            type="text"
            value={modelInfo.provider}
            onChange={(e) => setModelInfo({...modelInfo, provider: e.target.value})}
            placeholder="Provider"
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
        </div>
      </div>
      <div>
        <h3 className="text-lg font-medium text-gray-900">Input</h3>
        <div className="mt-2 grid grid-cols-2 gap-4">
          <input
            type="text"
            value={input.prompt}
            onChange={(e) => setInput({...input, prompt: e.target.value})}
            placeholder="Prompt"
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
          <input
            type="text"
            value={input.timestamp}
            onChange={(e) => setInput({...input, timestamp: e.target.value})}
            placeholder="Timestamp"
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
        </div>
      </div>
      <div>
        <h3 className="text-lg font-medium text-gray-900">Output</h3>
        <div className="mt-2 grid grid-cols-2 gap-4">
          <input
            type="text"
            value={output.response}
            onChange={(e) => setOutput({...output, response: e.target.value})}
            placeholder="Response"
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
          <input
            type="text"
            value={output.timestamp}
            onChange={(e) => setOutput({...output, timestamp: e.target.value})}
            placeholder="Timestamp"
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
        </div>
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <div className="flex justify-between">
        <button
          type="button"
          onClick={generateRandomData}
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          Generate Random Data
        </button>
        <button
          type="submit"
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Create Credential
        </button>
      </div>
    </form>
  );
};

export default CreateCredential;
