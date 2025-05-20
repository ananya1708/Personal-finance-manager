import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useNavigate } from "react-router-dom";
import AuthPage from "./pages/AuthPage";
import Dashboard from "./pages/Dashboard";

// A simple header that shows a navigation bar for authenticated users
function Header({ onLogout }) {
  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light mb-4">
      <div className="container">
        <Link className="navbar-brand" to="/dashboard">Finance Manager</Link>
        <div className="collapse navbar-collapse">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/dashboard">Dashboard</Link>
            </li>
          </ul>
          <button className="btn btn-outline-danger" onClick={onLogout}>Logout</button>
        </div>
      </div>
    </nav>
  );
}

function App() {
  const isAuthenticated = !!localStorage.getItem("token");
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <>
      {isAuthenticated && <Header onLogout={handleLogout} />}
      <Routes>
        <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" /> : <AuthPage />} />
        <Route path="/dashboard" element={isAuthenticated ? <Dashboard /> : <Navigate to="/" />} />
        {/* Fallback route: redirect unknown routes to home */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
}

// Wrap App in Router so that hooks like useNavigate work inside App
function AppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  );
}

export default AppWrapper;
