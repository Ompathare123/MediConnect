import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
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
    <g transform="translate(390,370) rotate(-35)" opacity="0.5">
      <rect x="0" y="4" width="36" height="8" rx="4" fill="#2bb3c0" />
      <polygon points="36,8 44,8 40,12 40,4" fill="#2bb3c0" />
      <line x1="44" y1="8" x2="52" y2="8" stroke="#2bb3c0" strokeWidth="2.5" strokeLinecap="round" />
    </g>
    <g transform="translate(170,490) rotate(-30)" opacity="0.5">
      <rect x="0" y="0" width="36" height="16" rx="8" fill="#2bb3c0" />
      <rect x="18" y="0" width="18" height="16" rx="8" fill="white" opacity="0.6" />
    </g>
    <g transform="translate(580, 80)" opacity="0.25">
      <path
        d="M20,0 Q80,40 20,80 Q-20,120 20,160 Q80,200 20,240 Q-20,280 20,320 Q80,360 20,400 Q-20,440 20,480 Q80,520 20,560 Q-20,600 20,640 Q80,680 20,720"
        fill="none"
        stroke="#2bb3c0"
        strokeWidth="2.5"
      />
      <path
        d="M100,0 Q40,40 100,80 Q140,120 100,160 Q40,200 100,240 Q140,280 100,320 Q40,360 100,400 Q140,440 100,480 Q40,520 100,560 Q140,600 100,640 Q40,680 100,720"
        fill="none"
        stroke="#2bb3c0"
        strokeWidth="2.5"
      />
    </g>
  </svg>
);

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      // Send login request to backend to verify real database user
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Invalid Email or Password");
        return;
      }

      // Store real data from database into localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role);
      localStorage.setItem("userName", data.user?.name || "User");
      localStorage.setItem("userId", data.user?.id);

      // Save Doctor profile ID if the user is a doctor
      if (data.role === "doctor" && data.doctorProfileId) {
        localStorage.setItem("doctorProfileId", data.doctorProfileId);
      }

      // Navigate based on the role assigned in the database
      if (data.role === "doctor") {
        navigate("/doctor-dashboard");
      } else if (data.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/patient-dashboard");
      }

    } catch (error) {
      setError("Server error. Check if the backend is running.");
    }
  };

  return (
    <div className="login-page login-reference" style={{ backgroundImage: `url(${doctorBg})` }}>
      <div className="overlay">
        <MedicalIcons />
        <div className="login-card login-ref-card">
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
          <h2>Sign In</h2>
          {error && (
            <div 
              className="error-alert" 
              style={{
                color: "#b91c1c", 
                backgroundColor: "#fee2e2", 
                padding: "8px", 
                borderRadius: "6px", 
                marginBottom: "10px", 
                fontSize: "14px"
              }}
            >
              {error}
            </div>
          )}
          <form onSubmit={handleLogin}>
            <div className="input-group">
              <span className="input-icon" aria-hidden="true"><FaEnvelope /></span>
              <input 
                type="email" 
                placeholder="Enter Email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
              />
            </div>
            <div className="input-group">
              <span className="input-icon" aria-hidden="true"><FaLock /></span>
              <input 
                type={showPassword ? "text" : "password"}
                placeholder="Enter Password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
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
            <div className="forgot-row">
              <a href="#" className="forgot-link">Forgot Password?</a>
            </div>
            <button type="submit">Sign In Securely</button>
          </form>
          <p className="register-text">New user? <Link to="/register">Register</Link></p>
        </div>
      </div>
    </div>
  );
}

export default Login;