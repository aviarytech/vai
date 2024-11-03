import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { ConversationWithVP } from '../../../backend/src/models/Conversation'
import { CONFIG } from '../config'
import { IVerifiableCredential } from '../../../backend/src/models/AICredential'
import { VerificationBadge } from '../components/VerificationBadge'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  modelInfo?: {
    name: string
    provider: string
  }
  id?: string
  issuer?: string
}

export function ConversationDetail() {
  const { id } = useParams<{ id: string }>()
  const [conversation, setConversation] = useState<ConversationWithVP | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchConversation = async () => {
      try {
        const response = await fetch(`${CONFIG.API_BASE_URL}/conversations/${id}`)
        const data = await response.json()
        
        if (data.success) {
          console.log(data.data)
          setConversation(data.data)
        } else {
          setError(data.error)
        }
      } catch {
        setError('Failed to fetch conversation')
      } finally {
        setLoading(false)
      }
    }

    fetchConversation()
  }, [id])

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>
  if (!conversation) return <div>Conversation not found</div>

  // Convert VCs into a flat array of messages
  const messages: Message[] = conversation.verifiablePresentation.verifiableCredential.flatMap((vc: IVerifiableCredential) => {
    const messages: Message[] = []
    
    // Add user message
    messages.push({
      role: 'user',
      content: vc.credentialSubject.input.prompt,
      timestamp: vc.credentialSubject.input.timestamp
    })

    // Add assistant message with issuer
    messages.push({
      role: 'assistant',
      content: vc.credentialSubject.output.response,
      timestamp: vc.credentialSubject.output.timestamp,
      modelInfo: vc.credentialSubject.modelInfo,
      id: vc.id,
      issuer: typeof vc.issuer === 'string' ? vc.issuer : vc.issuer.name || 'Unknown'
    })

    return messages
  })

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-4 ${
                message.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              <div className="relative w-full">
                <p>{message.content}</p>
              </div>
              {message.id && message.role === 'assistant' && (
                <div className="mt-2 text-xs opacity-75">
                  <a
                    href={`/verify?id=${message.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    See Context
                  </a>
                </div>
              )}
              <div className="mt-1 text-xs opacity-75 flex gap-2 justify-end items-center">
                {new Date(message.timestamp).toLocaleString()}
                {message.id && message.role === 'assistant' && message.issuer && (
                  <div className="">
                    <VerificationBadge issuer={message.issuer} />
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 