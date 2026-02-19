import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import PatientDashboard from "./pages/PatientDashboard";
import BookAppointment from "./pages/BookAppointment";
import Doctor from "./pages/Doctor";
import AdminDashboard from './pages/AdminDashboard';
function App() {
  return (
    <Router>
      <Routes>
        {/* Auth Routes */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/doctor-dashboard" element={<Doctor />} />
        <Route path="/admin" element={<AdminDashboard />} />

        {/* Standardized Dashboard Route 
          Matches the navigate("/patient-dashboard") logic 
        */}
        <Route path="/patient-dashboard" element={<PatientDashboard />} />
        
        {/* Book Appointment Route 
          Matches the navigate("/book-appointment") logic 
        */}
        <Route path="/book-appointment" element={<BookAppointment />} />

        {/* Optional: Alias for "/dashboard" 
          If any of your code uses navigate("/dashboard"), 
          this ensures it goes to the right place.
        */}
        <Route path="/dashboard" element={<Navigate to="/patient-dashboard" replace />} />

        {/* Catch-all: Redirect unknown routes to Login */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;