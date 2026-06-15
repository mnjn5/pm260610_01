import { useState } from 'react'

const MODEL_OPTIONS = ['Sonnet 4.6', 'Opus 4.8', '더 많은 모델', '업무 방법']

export default function ChatMessageInput({ value, onChange, onSubmit, selectedModel, onSelectModel }) {
  const [attachOpen, setAttachOpen] = useState(false)
  const [modelOpen, setModelOpen] = useState(false)

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      onSubmit()
    }
  }

  return (
    <div className="border-t border-gray-200 bg-white p-4">
      <div className="mx-auto max-w-3xl rounded-xl border border-gray-200 p-3">
        <textarea
          rows={2}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="메시지를 입력하세요..."
          className="block w-full resize-none border-0 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-0"
        />
        <div className="mt-2 flex items-center justify-between">
          <div className="relative">
            <button
              type="button"
              onClick={() => setAttachOpen((prev) => !prev)}
              className="flex h-8 w-8 items-center justify-center rounded-full text-lg text-gray-500 hover:bg-gray-100"
            >
              ➕
            </button>
            {attachOpen && (
              <div className="absolute bottom-full left-0 z-10 mb-1 w-48 rounded-md border border-gray-200 bg-white py-1 shadow-lg">
                <p className="px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50">파일 또는 사진 추가</p>
                <div className="my-1 border-t border-gray-100" />
                <p className="px-3 py-1 text-xs font-semibold uppercase tracking-wide text-gray-400">스킬</p>
                <p className="px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50">보유 스킬 1</p>
                <p className="px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50">보유 스킬 2</p>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <button
                type="button"
                onClick={() => setModelOpen((prev) => !prev)}
                className="rounded-md border border-gray-200 px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50"
              >
                {selectedModel} ▾
              </button>
              {modelOpen && (
                <div className="absolute bottom-full right-0 z-10 mb-1 w-40 rounded-md border border-gray-200 bg-white py-1 shadow-lg">
                  {MODEL_OPTIONS.map((model) => (
                    <button
                      key={model}
                      type="button"
                      onClick={() => {
                        onSelectModel(model)
                        setModelOpen(false)
                      }}
                      className={`block w-full px-3 py-1.5 text-left text-sm hover:bg-gray-50 ${
                        model === selectedModel ? 'text-indigo-600' : 'text-gray-700'
                      }`}
                    >
                      {model}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              type="button"
              className="flex h-8 w-8 items-center justify-center rounded-full text-lg text-gray-500 hover:bg-gray-100"
            >
              🎙️
            </button>
            <button
              type="button"
              onClick={onSubmit}
              disabled={!value.trim()}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              ↑
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
