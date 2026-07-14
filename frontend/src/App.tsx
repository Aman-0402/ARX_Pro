import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import RequireAuth from "@/components/RequireAuth";
import Layout from "@/components/layout/Layout";
import HomePage from "@/pages/HomePage";
import AboutPage from "@/pages/AboutPage";
import ServicesPage from "@/pages/ServicesPage";
import PortfolioPage from "@/pages/PortfolioPage";
import TeamPage from "@/pages/TeamPage";
import BlogListPage from "@/pages/BlogListPage";
import BlogPostPage from "@/pages/BlogPostPage";
import ContactPage from "@/pages/ContactPage";
import VerifyPage from "@/pages/VerifyPage";
import ExamRegisterPage from "@/pages/exam/ExamRegisterPage";
import ExamPage from "@/pages/exam/ExamPage";
import ExamResultPage from "@/pages/exam/ExamResultPage";
import AdminLoginPage from "@/pages/admin/AdminLoginPage";
import AdminDashboardPage from "@/pages/admin/AdminDashboardPage";
import ResourceListPage from "@/pages/admin/ResourceListPage";
import ResourceFormPage from "@/pages/admin/ResourceFormPage";
import SettingsPage from "@/pages/admin/SettingsPage";
import NotFoundPage from "@/pages/NotFoundPage";

export default function App() {
  return (
    <AuthProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/portfolio" element={<PortfolioPage />} />
          <Route path="/team" element={<TeamPage />} />
          <Route path="/blog" element={<BlogListPage />} />
          <Route path="/blog/:slug" element={<BlogPostPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/verify" element={<VerifyPage />} />
          <Route path="/exam/register" element={<ExamRegisterPage />} />
          <Route path="/exam" element={<ExamPage />} />
          <Route path="/exam/result" element={<ExamResultPage />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route element={<RequireAuth />}>
            <Route path="/admin" element={<AdminDashboardPage />}>
              <Route index element={<ResourceListPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path=":resource" element={<ResourceListPage />} />
              <Route path=":resource/new" element={<ResourceFormPage />} />
              <Route path=":resource/:id" element={<ResourceFormPage />} />
            </Route>
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Layout>
    </AuthProvider>
  );
}
