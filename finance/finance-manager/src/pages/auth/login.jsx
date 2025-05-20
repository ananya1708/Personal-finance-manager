import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import "bootstrap/dist/css/bootstrap.min.css";
import "../../styles/auth.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoggingIn(true); // Start animation

    try {
      console.log("🔍 Attempting login for:", email); // Debugging

      const response = await axios.post("http://localhost:5000/api/users/login", { email, password });

      if (response.data.token && response.data.user) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("userId", response.data.user.id); // ✅ Store user ID separately
        localStorage.setItem("user", JSON.stringify(response.data.user));

        console.log("✅ User ID stored:", response.data.user.id);
        console.log("✅ Token stored:", response.data.token);

        setTimeout(() => {
          navigate("/dashboard");
        }, 1000); // Delay for animation effect
      } else {
        alert("❌ Login failed. Please try again.");
        setIsLoggingIn(false);
      }
    } catch (error) {
      console.error("❌ Login Error:", error);
      alert("Invalid credentials. Please try again.");
      setIsLoggingIn(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="auth-container"
    >
      <motion.div 
        className="auth-card"
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-center">Login</h2>
        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="input-group">
            <label>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          
          <motion.button
            type="submit"
            className="auth-btn"
            whileTap={{ scale: 0.9 }}
            animate={isLoggingIn ? { scale: 1.2, opacity: 0 } : {}}
            transition={{ duration: 0.5 }}
          >
            {isLoggingIn ? "Redirecting..." : "Login"}
          </motion.button>
        </form>

        <p className="text-center mt-3">
          Don't have an account? <Link to="/register" className="auth-link">Register here</Link>
        </p>
      </motion.div>

      {isLoggingIn && (
        <motion.div 
          className="redirect-overlay"
          initial={{ x: "-100vw" }}
          animate={{ x: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        />
      )}
    </motion.div>
  );
}
