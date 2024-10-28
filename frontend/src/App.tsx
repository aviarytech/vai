import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ChatInterface from './components/ChatInterface';
import VerifyCredential from './components/VerifyCredential';
import Navbar from './components/Navbar';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <Routes>
          <Route path="/" element={<ChatInterface />} />
          <Route path="/verify" element={<VerifyCredential />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
