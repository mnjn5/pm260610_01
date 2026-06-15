import { useParams } from 'react-router-dom'
import ChatLayout from '../../components/chat/ChatLayout'

export default function UnitManagePage() {
  const { unitName } = useParams()
  const decodedUnitName = unitName ? decodeURIComponent(unitName) : ''

  return (
    <ChatLayout>
      <div className="mx-auto max-w-5xl space-y-6 p-6">
        <div>
          <p className="text-sm text-gray-500">유닛 관리 / {decodedUnitName}</p>
          <h1 className="mt-1 text-xl font-semibold text-gray-900">{decodedUnitName} 관리</h1>
        </div>

        <div className="rounded-lg border border-dashed border-gray-300 bg-white p-12 text-center text-sm text-gray-500">
          유닛 관리 기능은 준비 중입니다.
        </div>
      </div>
    </ChatLayout>
  )
}
