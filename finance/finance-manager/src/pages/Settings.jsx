import React, { useEffect, useState } from "react";
import "../styles/Settings.css"; // optional for custom styling

const Settings = () => {
  const [currency, setCurrency] = useState("₹");
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const savedCurrency = localStorage.getItem("currency") || "₹";
    const savedDarkMode = localStorage.getItem("darkMode") === "true";

    setCurrency(savedCurrency);
    setDarkMode(savedDarkMode);

    document.body.classList.toggle("dark-mode", savedDarkMode);
  }, []);

  const handleCurrencyChange = (e) => {
    const newCurrency = e.target.value;
    setCurrency(newCurrency);
    localStorage.setItem("currency", newCurrency);
  };

  const handleDarkModeToggle = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem("darkMode", newDarkMode);
    document.body.classList.toggle("dark-mode", newDarkMode);
  };

  return (
    <div className="settings-container">
      <h2>Settings</h2>

      <div className="setting-item">
        <label>Preferred Currency:</label>
        <select value={currency} onChange={handleCurrencyChange}>
          <option value="₹">₹ - INR</option>
          <option value="$">$ - USD</option>
          <option value="€">€ - EUR</option>
        </select>
      </div>

      <div className="setting-item">
        <label>
          <input type="checkbox" checked={darkMode} onChange={handleDarkModeToggle} />
          Enable Dark Mode
        </label>
      </div>
    </div>
  );
};

export default Settings;
