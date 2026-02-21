import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../styles/auth.css";
import doctorBg from "../assets/doctor.png";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ email, password })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message);
        return;
      }

      // 1. Save all necessary session data
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role);
      // Using optional chaining to prevent errors if data.user is missing
      localStorage.setItem("userName", data.user?.name || "User");

      // 2. Redirect based on the role provided by authController.js
      if (data.role === "doctor") {
        navigate("/doctor-dashboard"); // This will open the new Doctor Panel
      } else if (data.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/patient-dashboard");
      }

    } catch (error) {
      setError("Server error. Check backend connection.");
    }
  };

  return (
    <div className="login-page" style={{ backgroundImage: `url(${doctorBg})` }}>
      <div className="overlay">
        <div className="login-card">
          <h2>Sign In</h2>

          {error && (
            <div
              style={{
                color: "#b91c1c",
                backgroundColor: "#fee2e2",
                padding: "8px",
                borderRadius: "6px",
                marginBottom: "10px",
                fontSize: "14px",
                fontWeight: "500"
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <input
              type="email"
              placeholder="Enter Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <input
              type="password"
              placeholder="Enter Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button type="submit">Login</button>
          </form>

          <p className="register-text">
            New user? <Link to="/register">Register</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;