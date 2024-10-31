import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Header } from './components/Header'
import { Conversations } from './pages/Conversations'
import { ConversationDetail } from './pages/ConversationDetail'
import ChatInterface from './components/ChatInterface'
import { Landing } from './pages/Landing'

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
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}
