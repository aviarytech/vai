import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <nav className="bg-primary-600 text-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="font-bold text-xl">AI Credential Verifier</Link>
          <div className="space-x-4">
            <Link to="/" className="hover:text-primary-200">Dashboard</Link>
            <Link to="/create" className="hover:text-primary-200">Create</Link>
            <Link to="/verify" className="hover:text-primary-200">Verify</Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
