import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/auth.css";
import doctorBg from "../assets/doctor.png";

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

      // --- POPUP LOGIC ---
      // This will pause execution until the user clicks "OK"
      alert("🎉 Registration Successful! You can now log in.");
      
      // Redirect to login after the user dismisses the alert
      navigate("/login"); 

    } catch (err) {
      console.error("Network or Server Error:", err);
      setError("Cannot connect to server. Is your backend running on port 5000?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page" style={{ backgroundImage: `url(${doctorBg})` }}>
      <div className="overlay">
        <div className="login-card">
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
            <input name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} required />
            <input name="email" type="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
            <input name="password" type="password" placeholder="Password" value={formData.password} onChange={handleChange} required />
            <input name="phone" placeholder="Phone" maxLength="10" value={formData.phone} onChange={handleChange} required />
            
            <select name="gender" value={formData.gender} onChange={handleChange} required>
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>

            <textarea name="address" placeholder="Address" value={formData.address} onChange={handleChange} required></textarea>

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