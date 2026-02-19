import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/auth.css";
import doctorBg from "../assets/doctor.png";

function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    gender: "",
    address: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone) => {
    const phoneRegex = /^[0-9]{10}$/; // exactly 10 digits
    return phoneRegex.test(phone);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    // ✅ Email validation
    if (!validateEmail(formData.email)) {
      setError("Please enter a valid email address.");
      return;
    }

    // ✅ Phone validation
    if (!validatePhone(formData.phone)) {
      setError("Phone number must contain exactly 10 digits.");
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message);
        return;
      }

      // ✅ POPUP AFTER SUCCESS
      alert("Registration successful!");

      // Redirect to login
      window.location.href = "/login";

    } catch (err) {
      setError("Server error. Check backend.");
    }
  };

  return (
    <div className="login-page" style={{ backgroundImage: `url(${doctorBg})` }}>
      <div className="overlay">
        <div className="login-card">
          <h2>Create Account</h2>

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

          <form onSubmit={handleRegister}>
            <input
              name="name"
              placeholder="Full Name"
              onChange={handleChange}
              required
            />

            <input
              name="email"
              type="email"
              placeholder="Email"
              onChange={handleChange}
              required
            />

            <input
              name="password"
              type="password"
              placeholder="Password"
              onChange={handleChange}
              required
            />

            <input
              name="phone"
              placeholder="Phone"
              maxLength="10"
              onChange={handleChange}
              required
            />

            <select name="gender" onChange={handleChange} required>
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>

            <textarea
              name="address"
              placeholder="Address"
              onChange={handleChange}
            ></textarea>

            <button type="submit">Register</button>
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
