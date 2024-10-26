import { useState } from 'react';

function CreateCredential() {
  const [formData, setFormData] = useState({
    modelName: '',
    provider: '',
    prompt: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prevData => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // TODO: Implement API call to create credential
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Create AI Credential</h1>
      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6">
        <div className="mb-4">
          <label htmlFor="modelName" className="block text-sm font-medium text-neutral-700">Model Name</label>
          <input
            type="text"
            id="modelName"
            name="modelName"
            value={formData.modelName}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-neutral-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="provider" className="block text-sm font-medium text-neutral-700">Provider</label>
          <input
            type="text"
            id="provider"
            name="provider"
            value={formData.provider}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-neutral-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="prompt" className="block text-sm font-medium text-neutral-700">Prompt</label>
          <textarea
            id="prompt"
            name="prompt"
            value={formData.prompt}
            onChange={handleChange}
            rows={4}
            className="mt-1 block w-full rounded-md border-neutral-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            required
          ></textarea>
        </div>
        <button type="submit" className="btn btn-primary">Create Credential</button>
      </form>
    </div>
  );
}

export default CreateCredential;
