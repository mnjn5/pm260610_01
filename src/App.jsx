import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/auth/ProtectedRoute'
import Layout from './components/common/Layout'
import LoginPage from './pages/LoginPage'
import MyPage from './pages/user/MyPage'
import RequestFormPage from './pages/user/RequestFormPage'
import LeaderDashboardPage from './pages/leader/LeaderDashboardPage'
import NewChatPage from './pages/chat/NewChatPage'
import ChatGroupPage from './pages/chat/ChatGroupPage'
import UnitManagePage from './pages/unit/UnitManagePage'
import { DASHBOARD_ROLES } from './utils/constants'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />

          <Route
            path="/chat"
            element={
              <ProtectedRoute>
                <NewChatPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/chat/personal"
            element={
              <ProtectedRoute>
                <ChatGroupPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/chat/unit/:unitName"
            element={
              <ProtectedRoute>
                <ChatGroupPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/chat/unit/:unitName/manage"
            element={
              <ProtectedRoute>
                <UnitManagePage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/mypage"
            element={
              <ProtectedRoute>
                <Layout>
                  <MyPage />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/mypage/request"
            element={
              <ProtectedRoute>
                <Layout>
                  <RequestFormPage />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/leader"
            element={
              <ProtectedRoute role={DASHBOARD_ROLES}>
                <Layout>
                  <LeaderDashboardPage />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
