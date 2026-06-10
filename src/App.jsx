import { Routes, Route } from 'react-router-dom'
import Layout from './components/common/Layout'
import ProtectedRoute from './components/auth/ProtectedRoute'
import AdminRoute from './components/admin/AdminRoute'
import AdminLayout from './components/admin/AdminLayout'

import HomePage from './pages/HomePage'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'

import ProductListPage from './pages/products/ProductListPage'
import ProductDetailPage from './pages/products/ProductDetailPage'

import BoardListPage from './pages/board/BoardListPage'
import BoardDetailPage from './pages/board/BoardDetailPage'
import BoardWritePage from './pages/board/BoardWritePage'

import ContactPage from './pages/contact/ContactPage'
import ContactCompletePage from './pages/contact/ContactCompletePage'

import MyPage from './pages/mypage/MyPage'

import AdminDashboardPage from './pages/admin/AdminDashboardPage'
import AdminUserListPage from './pages/admin/AdminUserListPage'
import AdminPostListPage from './pages/admin/AdminPostListPage'
import AdminProductListPage from './pages/admin/AdminProductListPage'
import AdminProductFormPage from './pages/admin/AdminProductFormPage'
import AdminInquiryListPage from './pages/admin/AdminInquiryListPage'
import AdminInquiryDetailPage from './pages/admin/AdminInquiryDetailPage'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />

        <Route path="products" element={<ProductListPage />} />
        <Route path="products/:id" element={<ProductDetailPage />} />

        <Route path="board" element={<BoardListPage />} />
        <Route path="board/posts/:id" element={<BoardDetailPage />} />
        <Route
          path="board/posts/new"
          element={
            <ProtectedRoute>
              <BoardWritePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="board/posts/:id/edit"
          element={
            <ProtectedRoute>
              <BoardWritePage />
            </ProtectedRoute>
          }
        />

        <Route path="contact" element={<ContactPage />} />
        <Route path="contact/complete" element={<ContactCompletePage />} />

        <Route
          path="mypage"
          element={
            <ProtectedRoute>
              <MyPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="admin"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route index element={<AdminDashboardPage />} />
          <Route path="users" element={<AdminUserListPage />} />
          <Route path="posts" element={<AdminPostListPage />} />
          <Route path="products" element={<AdminProductListPage />} />
          <Route path="products/new" element={<AdminProductFormPage />} />
          <Route path="products/:id/edit" element={<AdminProductFormPage />} />
          <Route path="inquiries" element={<AdminInquiryListPage />} />
          <Route path="inquiries/:id" element={<AdminInquiryDetailPage />} />
        </Route>
      </Route>
    </Routes>
  )
}
