import ChatSidebar from './ChatSidebar'

export default function ChatLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <ChatSidebar />
      <main className="flex-1">{children}</main>
    </div>
  )
}
