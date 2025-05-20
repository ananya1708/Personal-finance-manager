import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

import Login from "./pages/auth/login.jsx";
import Register from "./pages/auth/register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Transaction from "./pages/Transaction.jsx";
import Budget from "./pages/Budget.jsx"; // ✅ Added Budget Page
import Settings from "./pages/Settings.jsx"; // ✅ Added Settings Page

// ✅ Authenticated Route Wrapper (Protects Dashboard, Transactions, Budget, Settings)
const ProtectedRoute = ({ element }) => {
  const isAuthenticated = localStorage.getItem("token"); // Check if user is logged in
  return isAuthenticated ? element : <Navigate to="/login" />;
};

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <Router>
    <Routes>
      <Route path="/" element={<Navigate to="/register" />} /> {/* Default to Register */}
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      
      {/* ✅ Protected Routes */}
      <Route path="/dashboard" element={<ProtectedRoute element={<Dashboard />} />} />
      <Route path="/transactions" element={<ProtectedRoute element={<Transaction />} />} />
      <Route path="/budget" element={<ProtectedRoute element={<Budget />} />} />
      <Route path="/settings" element={<ProtectedRoute element={<Settings />} />} /> {/* ✅ Added Route */}
    </Routes>
  </Router>
);
