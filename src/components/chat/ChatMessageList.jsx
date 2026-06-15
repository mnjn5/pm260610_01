export default function ChatMessageList({ messages }) {
  if (messages.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-sm text-gray-400">메시지를 입력해 대화를 시작하세요.</p>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-3 overflow-y-auto p-6">
      {messages.map((message, index) => (
        <div
          key={index}
          className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
        >
          <div
            className={`max-w-lg rounded-lg px-4 py-2 text-sm ${
              message.role === 'user'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-800 ring-1 ring-gray-200'
            }`}
          >
            {message.text}
          </div>
        </div>
      ))}
    </div>
  )
}
