import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaPhone,
  FaVenusMars,
  FaMapMarkerAlt,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import toast from "react-hot-toast";
import "../styles/auth.css";
import doctorBg from "../assets/doctor.png";

const MedicalIcons = () => (
  <svg
    className="medical-overlay-icons"
    viewBox="0 0 1400 900"
    preserveAspectRatio="xMidYMid slice"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <polyline
      points="60,460 160,460 190,380 220,540 260,380 300,460 400,460"
      fill="none"
      stroke="#2bb3c0"
      strokeWidth="2.5"
      opacity="0.35"
    />
    <path
      d="M230,310 C230,295 215,280 200,290 C185,280 170,295 170,310 C170,330 200,350 200,350 C200,350 230,330 230,310Z"
      fill="#2bb3c0"
      opacity="0.55"
    />
    <polyline
      points="160,320 175,320 182,308 192,336 202,308 212,320 240,320"
      fill="none"
      stroke="white"
      strokeWidth="2"
    />
    <g transform="translate(340,240)" opacity="0.5">
      <rect x="12" y="0" width="6" height="28" rx="3" fill="#2bb3c0" />
      <rect x="0" y="28" width="30" height="6" rx="3" fill="#2bb3c0" />
      <ellipse cx="15" cy="8" rx="10" ry="14" fill="none" stroke="#2bb3c0" strokeWidth="2.5" />
      <line x1="15" y1="22" x2="15" y2="34" stroke="#2bb3c0" strokeWidth="2" />
      <rect x="5" y="34" width="20" height="4" rx="2" fill="#2bb3c0" />
    </g>
  </svg>
);

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    gender: "",
    address: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          email: formData.email.toLowerCase(),
          role: "patient" 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Registration failed");
        setLoading(false);
        return;
      }

      toast.success("Registration successful. You can now log in.");
      
      navigate("/login"); 

    } catch (err) {
      console.error("Network or Server Error:", err);
      setError("Cannot connect to server. Is your backend running on port 5000?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page login-reference register-reference" style={{ backgroundImage: `url(${doctorBg})` }}>
      <div className="overlay">
        <MedicalIcons />
        <div className="login-card login-ref-card login-card-with-brand">
          <div className="login-brand-wrap" aria-label="MediConnect logo">
            <div className="login-brand-row">
              <span className="brand-mc" aria-hidden="true">
                <span>M</span>
                <span>C</span>
              </span>
              <span className="brand-name-stack">
                <span>Medi</span>
                <span>Connect</span>
              </span>
              <span className="brand-heart" aria-hidden="true">
                <svg viewBox="0 0 24 24">
                  <path d="M12.1 21.35l-1.1-1.02C5.14 14.92 2 12.05 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.55-3.14 6.42-8.99 11.84l-.91.83z" />
                  <path d="M17.8 8.2h-1.6V6.6a.6.6 0 0 0-1.2 0v1.6h-1.6a.6.6 0 0 0 0 1.2H15v1.6a.6.6 0 0 0 1.2 0V9.4h1.6a.6.6 0 0 0 0-1.2z" />
                </svg>
              </span>
            </div>
            <p className="login-brand-subtitle">Access Your Secure Medical Portal</p>
          </div>
          <h2>Create Account</h2>

          {error && (
            <div style={{ 
              color: "#b91c1c", 
              backgroundColor: "#fee2e2", 
              padding: "10px", 
              borderRadius: "8px", 
              marginBottom: "15px", 
              fontSize: "14px",
              fontWeight: "500",
              textAlign: "center"
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleRegister}>
            <div className="input-group">
              <span className="input-icon" aria-hidden="true"><FaUser /></span>
              <input name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} required />
            </div>

            <div className="input-group">
              <span className="input-icon" aria-hidden="true"><FaEnvelope /></span>
              <input name="email" type="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
            </div>

            <div className="input-group">
              <span className="input-icon" aria-hidden="true"><FaLock /></span>
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            <div className="input-group">
              <span className="input-icon" aria-hidden="true"><FaPhone /></span>
              <input name="phone" placeholder="Phone" maxLength="10" value={formData.phone} onChange={handleChange} required />
            </div>

            <div className="input-group">
              <span className="input-icon" aria-hidden="true"><FaVenusMars /></span>
              <select name="gender" value={formData.gender} onChange={handleChange} required>
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="input-group">
              <span className="input-icon" aria-hidden="true"><FaMapMarkerAlt /></span>
              <input name="address" placeholder="Address" value={formData.address} onChange={handleChange} required />
            </div>

            <button type="submit" disabled={loading}>
              {loading ? "Registering..." : "Register"}
            </button>
          </form>

          <p className="register-text">
            Already have account? <Link to="/login">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;