import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import PatientDashboard from "./pages/PatientDashboard";
import BookAppointment from "./pages/BookAppointment";
import Doctor from "./pages/Doctor";
import AdminDashboard from './pages/AdminDashboard';
import MyAppointments from "./pages/MyAppointments";
import DoctorsList from "./pages/DoctorsList"; // ADDED THIS

function App() {
  return (
    <Router>
      <Routes>
        {/* Auth Routes */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Doctor Routes */}
        <Route path="/doctor-dashboard" element={<Doctor />} />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminDashboard />} />

        {/* Patient Routes */}
        <Route path="/patient-dashboard" element={<PatientDashboard />} />
        <Route path="/book-appointment" element={<BookAppointment />} />
        <Route path="/appointments" element={<MyAppointments />} />
        <Route path="/doctors" element={<DoctorsList />} /> {/* ADDED THIS */}

        {/* Alias for "/dashboard" */}
        <Route path="/dashboard" element={<Navigate to="/patient-dashboard" replace />} />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;