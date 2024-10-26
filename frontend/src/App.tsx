import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import CreateCredential from './components/CreateCredential';
import VerifyCredential from './components/VerifyCredential';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-neutral-50">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/create" element={<CreateCredential />} />
            <Route path="/verify" element={<VerifyCredential />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
