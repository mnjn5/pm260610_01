import { useState } from 'react'
import { useAuthContext } from '../../context/AuthContext'
import ChatLayout from '../../components/chat/ChatLayout'
import ChatMessageList from '../../components/chat/ChatMessageList'
import ChatMessageInput from '../../components/chat/ChatMessageInput'

const DEMO_REPLY = '데모 응답입니다. 실제 AI 연동은 추후 적용될 예정입니다.'

export default function NewChatPage() {
  const { profile } = useAuthContext()
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [selectedModel, setSelectedModel] = useState('Sonnet 4.6')

  const usagePercent =
    profile?.current_limit > 0 ? (profile.used_amount / profile.current_limit) * 100 : 0
  const showLowTokenBanner = usagePercent >= 90

  const handleSubmit = () => {
    const text = input.trim()
    if (!text) return

    setMessages((prev) => [...prev, { role: 'user', text }])
    setInput('')

    setTimeout(() => {
      setMessages((prev) => [...prev, { role: 'assistant', text: DEMO_REPLY }])
    }, 600)
  }

  return (
    <ChatLayout>
      <div className="flex h-screen flex-col">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <p className="text-sm text-gray-500">개인 채팅 / 새 채팅</p>
          {showLowTokenBanner && (
            <p className="rounded-md bg-orange-50 px-3 py-1.5 text-xs font-medium text-orange-700">
              대화 오류 표시: 토큰이 부족합니다.
            </p>
          )}
        </div>

        <ChatMessageList messages={messages} />

        <ChatMessageInput
          value={input}
          onChange={setInput}
          onSubmit={handleSubmit}
          selectedModel={selectedModel}
          onSelectModel={setSelectedModel}
        />
      </div>
    </ChatLayout>
  )
}
