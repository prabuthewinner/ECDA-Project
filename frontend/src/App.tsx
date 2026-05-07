import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { RequireAuth, RequireRole } from "./components/RequireAuth";
import Navbar from "./components/Navbar";
import LoginPage from "./pages/LoginPage";
import OperatorApplicationsPage from "./pages/operator/OperatorApplicationsPage";
import NewApplicationPage from "./pages/operator/NewApplicationPage";
import OperatorApplicationDetailPage from "./pages/operator/OperatorApplicationDetailPage";
import OfficerApplicationsPage from "./pages/officer/OfficerApplicationsPage";
import OfficerApplicationDetailPage from "./pages/officer/OfficerApplicationDetailPage";
import NotificationsPage from "./pages/NotificationsPage";

function RootRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === "OFFICER" ? "/officer/applications" : "/operator/applications"} replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/operator/applications" element={<RequireRole role="OPERATOR"><OperatorApplicationsPage /></RequireRole>} />
          <Route path="/operator/apply" element={<RequireRole role="OPERATOR"><NewApplicationPage /></RequireRole>} />
          <Route path="/operator/applications/:id" element={<RequireRole role="OPERATOR"><OperatorApplicationDetailPage /></RequireRole>} />
          <Route path="/officer/applications" element={<RequireRole role="OFFICER"><OfficerApplicationsPage /></RequireRole>} />
          <Route path="/officer/applications/:id" element={<RequireRole role="OFFICER"><OfficerApplicationDetailPage /></RequireRole>} />
          <Route path="/notifications" element={<RequireAuth><NotificationsPage /></RequireAuth>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
