import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { CONFIG } from '../config'

interface IConversation {
  id: string
  messageCount: number
  verifiablePresentation: {
    verifiableCredential: Array<{
      credentialSubject: {
        input: {
          prompt: string
          timestamp: string
        }
        output: {
          response: string
          timestamp: string
        }
      }
    }>
  }
  createdAt: string
}

export function Conversations() {
  const [conversations, setConversations] = useState<IConversation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchConversations()
  }, [])

  const fetchConversations = async () => {
    try {
      const response = await fetch(`${CONFIG.API_BASE_URL}/conversations`)
      const data = await response.json()
      
      if (data.success) {
        setConversations(data.data)
      } else {
        setError(data.error)
      }
    } catch {
      setError('Failed to fetch conversations')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Previous Conversations</h1>
      <div className="space-y-4">
        {conversations.map((conversation) => {
          const credentials = conversation.verifiablePresentation?.verifiableCredential || [];
          let messagePreview = 'No messages';
          
          if (credentials.length > 0) {
            const firstMessage = credentials[0].credentialSubject.input.prompt;
            messagePreview = firstMessage.length > 50 
              ? `${firstMessage.substring(0, 50)}...` 
              : firstMessage;
          }

          return (
            <Link
              key={conversation.id}
              to={`/conversation/${conversation.id}`}
              className="block p-4 border rounded hover:bg-gray-50"
            >
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1 min-w-0">
                  <h2 className="font-semibold text-left break-words">
                    {messagePreview}
                  </h2>
                  <div className="flex gap-2 text-sm text-gray-500 mt-1">
                    <span>{new Date(conversation.createdAt).toLocaleDateString()}</span>
                    <span>•</span>
                    <span>{conversation.messageCount} messages</span>
                  </div>
                </div>
                <span className="text-blue-500 flex-shrink-0">→</span>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
} 