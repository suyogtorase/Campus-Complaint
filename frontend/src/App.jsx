import { useContext } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider, AuthContext } from "./context/AuthContext";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import UserDash from "./pages/UserDash";
import RaiseComplaint from "./pages/RaiseComplaint";
import InchargeDash from "./pages/InchargeDash";
import AdminDash from "./pages/AdminDash";
import AllComplaints from "./pages/AllComplaints";

// Renders the correct dashboard based on the logged-in user's role
const RoleDashboard = () => {
  const { user } = useContext(AuthContext);
  switch (user?.role) {
    case "student":
    case "teacher":
      return <UserDash />;
    case "incharge":
      return <InchargeDash />;
    case "admin":
      return <AdminDash />;
    default:
      return <Navigate to="/landing" replace />;
  }
};

function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" />
      <BrowserRouter>
        <Routes>
          {/* ── Public routes ── */}
          <Route path="/landing"  element={<Landing />} />
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* ── Authenticated routes (wrapped in sidebar Layout) ── */}
          <Route element={<Layout />}>
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute allowedRoles={["student", "teacher", "incharge", "admin"]}>
                  <RoleDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/raise"
              element={
                <ProtectedRoute allowedRoles={["student", "teacher"]}>
                  <RaiseComplaint />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/complaints"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AllComplaints />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* ── Catch-all: redirect every unknown URL to landing ── */}
          <Route path="*" element={<Navigate to="/landing" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
