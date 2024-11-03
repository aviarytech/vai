import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Header } from './components/Header'
import { Conversations } from './pages/Conversations'
import { ConversationDetail } from './pages/ConversationDetail'
import ChatInterface from './components/ChatInterface'
import { Landing } from './pages/Landing'
import VerifyCredential from './components/VerifyCredential'
import { PublicSquare } from './components/PublicSquare'

export function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen">
        <Header />
        <main className="pt-16">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/chat/:id" element={<ChatInterface />} />
            <Route path="/conversations" element={<Conversations />} />
            <Route path="/conversation/:id" element={<ConversationDetail />} />
            <Route path="/verify" element={<VerifyCredential />} />
            <Route path="/public-square" element={<PublicSquare />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}
