import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "../../styles/auth.css";

export default function Register() {
  const [name, setName] = useState(""); // Updated from fullName to name
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/users/register", { 
        name,  // Changed fullName to name
        email, 
        password 
      });
      alert("Registration Successful! Please login.");
      navigate("/login");
    } catch (error) {
      alert("Registration failed. Try again.");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card animate-fade-in">
        <h2 className="text-center">Register</h2>
        <form onSubmit={handleRegister}>
          <div className="input-group">
            <label>Name</label> {/* Updated label */}
            <input 
              type="text" 
              value={name}  // Updated state reference
              onChange={(e) => setName(e.target.value)} 
              required 
            />
          </div>
          <div className="input-group">
            <label>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="input-group">
            <label>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <button type="submit" className="auth-btn">Register</button>
        </form>
        <p className="text-center mt-3">
          Already have an account? <Link to="/login" className="auth-link">Login here</Link>
        </p>
      </div>
    </div>
  );
}
