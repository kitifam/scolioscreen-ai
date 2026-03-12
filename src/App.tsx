import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import ConsentPage from "./pages/ConsentPage";
import PoseGuidePage from "./pages/PoseGuidePage";
import CapturePage from "./pages/CapturePage";
import ResultPage from "./pages/ResultPage";
import InstallPage from "./pages/InstallPage";
import NotFound from "./pages/NotFound";
import SettingsPage from "./pages/SettingsPage";
import ProgressPage from "./pages/ProgressPage";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";

const queryClient = new QueryClient();

// Protected Route wrapper component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <LanguageProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/install" element={<InstallPage />} />

              {/* Protected routes */}
              <Route path="/consent" element={
                <ProtectedRoute><ConsentPage /></ProtectedRoute>
              } />
              <Route path="/guide" element={
                <ProtectedRoute><PoseGuidePage /></ProtectedRoute>
              } />
              <Route path="/capture" element={
                <ProtectedRoute><CapturePage /></ProtectedRoute>
              } />
              <Route path="/result" element={
                <ProtectedRoute><ResultPage /></ProtectedRoute>
              } />
              <Route path="/settings" element={
                <ProtectedRoute><SettingsPage /></ProtectedRoute>
              } />
              <Route path="/progress" element={
                <ProtectedRoute><ProgressPage /></ProtectedRoute>
              } />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </LanguageProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
