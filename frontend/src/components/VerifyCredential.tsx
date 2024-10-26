import { useState } from 'react';

function VerifyCredential() {
  const [credentialId, setCredentialId] = useState('');
  const [verificationResult, setVerificationResult] = useState<null | { isValid: boolean; message: string }>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement API call to verify credential
    // For now, we'll just simulate a response
    setVerificationResult({
      isValid: Math.random() > 0.5,
      message: 'Verification completed.',
    });
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Verify AI Credential</h1>
      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6 mb-6">
        <div className="mb-4">
          <label htmlFor="credentialId" className="block text-sm font-medium text-neutral-700">Credential ID</label>
          <input
            type="text"
            id="credentialId"
            value={credentialId}
            onChange={(e) => setCredentialId(e.target.value)}
            className="mt-1 block w-full rounded-md border-neutral-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            required
          />
        </div>
        <button type="submit" className="btn btn-primary">Verify Credential</button>
      </form>
      {verificationResult && (
        <div className={`p-4 rounded-md ${verificationResult.isValid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          <p className="font-semibold">{verificationResult.isValid ? 'Valid Credential' : 'Invalid Credential'}</p>
          <p>{verificationResult.message}</p>
        </div>
      )}
    </div>
  );
}

export default VerifyCredential;
