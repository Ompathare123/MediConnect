import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Welcome from "./pages/Welcome";
import PatientDashboard from "./pages/PatientDashboard";
import BookAppointment from "./pages/BookAppointment";
import Doctor from "./pages/Doctor";
import AdminDashboard from './pages/AdminDashboard';
import MyAppointments from "./pages/MyAppointments";
import DoctorsList from "./pages/DoctorsList";
import Prescriptions from "./pages/Prescriptions";
// --- ONLY IMPORTING WHAT YOU HAVE CREATED ---
import PatientProfile from "./pages/PatientProfile";

const getHomeByRole = (role) => {
  if (role === "admin") return "/admin";
  if (role === "doctor") return "/doctor-dashboard";
  return "/patient-dashboard";
};

const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to={getHomeByRole(role)} replace />;
  }

  return children;
};

const PublicRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (token) {
    return <Navigate to={getHomeByRole(role)} replace />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 2800,
          style: {
            borderRadius: "14px",
            background: "#0f172a",
            color: "#f8fafc",
            fontWeight: 700,
            fontSize: "13px",
            boxShadow: "0 10px 30px rgba(15, 23, 42, 0.28)"
          },
          success: {
            style: {
              background: "#14532d"
            }
          },
          error: {
            style: {
              background: "#7f1d1d"
            }
          }
        }}
      />
      <Routes>
        {/* Auth Routes */}
        <Route path="/" element={<PublicRoute><Welcome /></PublicRoute>} />
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

        {/* Doctor Routes */}
        <Route path="/doctor-dashboard" element={<ProtectedRoute allowedRoles={["doctor"]}><Doctor /></ProtectedRoute>} />

        {/* Admin Routes */}
        <Route path="/admin" element={<ProtectedRoute allowedRoles={["admin"]}><AdminDashboard /></ProtectedRoute>} />

        {/* Patient Routes */}
        <Route path="/patient-dashboard" element={<ProtectedRoute allowedRoles={["patient"]}><PatientDashboard /></ProtectedRoute>} />
        <Route path="/book-appointment" element={<ProtectedRoute allowedRoles={["patient"]}><BookAppointment /></ProtectedRoute>} />
        <Route path="/appointments" element={<ProtectedRoute allowedRoles={["patient"]}><MyAppointments /></ProtectedRoute>} />
        <Route path="/doctors" element={<ProtectedRoute allowedRoles={["patient"]}><DoctorsList /></ProtectedRoute>} />
        <Route path="/prescriptions" element={<ProtectedRoute allowedRoles={["patient"]}><Prescriptions /></ProtectedRoute>} />
        
        {/* PATIENT PROFILE ROUTE */}
        <Route path="/profile" element={<ProtectedRoute allowedRoles={["patient"]}><PatientProfile /></ProtectedRoute>} />

        {/* Alias for "/dashboard" */}
        <Route path="/dashboard" element={<ProtectedRoute><Navigate to={getHomeByRole(localStorage.getItem("role"))} replace /></ProtectedRoute>} />
        
        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;