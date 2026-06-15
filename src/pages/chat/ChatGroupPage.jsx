import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useAuthContext } from '../../context/AuthContext'
import { useUnit } from '../../hooks/useUnit'
import ChatLayout from '../../components/chat/ChatLayout'
import AddUsageRequestCard from '../../components/chat/AddUsageRequestCard'

const TABS = [
  { key: 'all', label: '전체' },
  { key: 'folder', label: '폴더' },
  { key: 'chat', label: '채팅' },
]

const DEMO_ITEMS = [
  { type: '폴더', name: '01 프로젝트' },
  { type: '폴더', name: '02 보고서' },
  { type: '채팅', name: '주간 업무 정리' },
  { type: '채팅', name: '신규 캠페인 아이디어 회의' },
  { type: '채팅', name: '예산 검토 요청' },
]

export default function ChatGroupPage() {
  const { profile } = useAuthContext()
  const { unitName } = useParams()
  const [activeTab, setActiveTab] = useState('all')

  const isPersonal = !unitName
  const decodedUnitName = isPersonal ? null : decodeURIComponent(unitName)
  const title = isPersonal ? '개인 채팅' : decodedUnitName
  const breadcrumb = isPersonal ? '개인 채팅' : `유닛 관리 / ${title}`

  const { isUnitManager, unitUsage } = useUnit(decodedUnitName)

  const visibleItems = DEMO_ITEMS.filter((item) => {
    if (activeTab === 'all') return true
    if (activeTab === 'folder') return item.type === '폴더'
    return item.type === '채팅'
  })

  return (
    <ChatLayout>
      <div className="mx-auto max-w-5xl space-y-6 p-6">
        <div>
          <p className="text-sm text-gray-500">{breadcrumb}</p>
          <h1 className="mt-1 text-xl font-semibold text-gray-900">{title}</h1>
          <p className="mt-1 text-sm text-gray-500">
            {isPersonal
              ? '개인 채팅 공간입니다. 자유롭게 대화를 시작하거나 추가 사용량을 요청할 수 있습니다.'
              : `${title} 유닛의 채팅 및 자료 공간입니다.`}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            <input
              type="text"
              placeholder="🔍 채팅 또는 폴더 검색"
              readOnly
              className="w-full cursor-default rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-400"
            />

            <div className="flex gap-2 border-b border-gray-200">
              {TABS.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`border-b-2 px-4 py-2 text-sm font-medium ${
                    activeTab === tab.key
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <ul className="divide-y divide-gray-100 rounded-lg border border-gray-200 bg-white">
              {visibleItems.map((item) => (
                <li key={item.name} className="flex items-center gap-3 px-4 py-3 text-sm">
                  <span className="text-base">{item.type === '폴더' ? '📁' : '💬'}</span>
                  <span className="text-gray-800">{item.name}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <AddUsageRequestCard
              profile={profile}
              isUnitManager={isUnitManager}
              unitUsage={unitUsage}
              unitName={decodedUnitName}
            />

            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <h3 className="text-sm font-semibold text-gray-900">유닛 허브</h3>
              <div className="mt-3 space-y-2">
                <button
                  type="button"
                  className="w-full rounded-md border border-gray-200 px-3 py-2 text-left text-sm text-gray-600 hover:bg-gray-50"
                >
                  📦 산출물
                </button>
                <button
                  type="button"
                  className="w-full rounded-md border border-gray-200 px-3 py-2 text-left text-sm text-gray-600 hover:bg-gray-50"
                >
                  🗂️ 자산
                </button>
              </div>
              <div className="mt-4">
                <p className="text-xs font-medium text-gray-500">정책과 지침</p>
                <p className="mt-1 text-sm text-gray-600">
                  유닛 내 토큰 사용은 사내 AI 사용 정책을 따릅니다. 한도 초과가 예상될 경우 추가 요청을
                  통해 유닛 리더의 승인을 받아주세요.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ChatLayout>
  )
}
