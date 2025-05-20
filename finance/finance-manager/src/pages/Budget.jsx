import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/Budget.css";

const Budget = () => {
  const [budgets, setBudgets] = useState([]);
  const [formData, setFormData] = useState({ category: "", limit: "", month: "", year: "" });
  const [editBudgetId, setEditBudgetId] = useState(null); // Track budget being edited
  const userId = localStorage.getItem("userId");

  const months = [
    { value: "01", label: "January" }, { value: "02", label: "February" },
    { value: "03", label: "March" }, { value: "04", label: "April" },
    { value: "05", label: "May" }, { value: "06", label: "June" },
    { value: "07", label: "July" }, { value: "08", label: "August" },
    { value: "09", label: "September" }, { value: "10", label: "October" },
    { value: "11", label: "November" }, { value: "12", label: "December" }
  ];

  const years = Array.from({ length: 10 }, (_, i) => (new Date().getFullYear() - 5 + i).toString());

  const fetchBudgets = useCallback(async () => {
    if (!userId || !formData.year || !formData.month) return;
    try {
      const res = await axios.get(`http://localhost:5000/api/budget/${userId}/${formData.month}/${formData.year}`);
      setBudgets(res.data);
    } catch (err) {
      console.error("Error fetching budgets:", err);
    }
  }, [userId, formData.month, formData.year]);

  useEffect(() => {
    fetchBudgets();
  }, [fetchBudgets]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editBudgetId) {
        // Update existing budget - Fixed syntax error in the URL
        await axios.put(`http://localhost:5000/api/budget/${editBudgetId}`, { limit: formData.limit });
        setEditBudgetId(null); // Reset editing state
      } else {
        // Add new budget
        await axios.post("http://localhost:5000/api/budget/set", { ...formData, userId });
      }
      setFormData({ category: "", limit: "", month: "", year: "" });
      setTimeout(fetchBudgets, 500); // Ensure UI updates after adding/updating
    } catch (err) {
      console.error("Error saving budget:", err);
    }
  };

  const handleEdit = (budget) => {
    setFormData({
      category: budget.category,
      limit: budget.limit,
      month: budget.month,
      year: budget.year,
    });
    setEditBudgetId(budget._id); // Set the budget being edited
  };

  const deleteBudget = async (budgetId) => {
    try {
      await axios.delete(`http://localhost:5000/api/budget/${budgetId}`);
      setBudgets((prev) => prev.filter((budget) => budget._id !== budgetId));
    } catch (err) {
      console.error("Error deleting budget:", err);
    }
  };

  return (
    <div className="container mt-4 budget-container">
      <h2 className="text-center budget-title">💰 Manage Your Budget</h2>

      {/* Budget Form */}
      <form onSubmit={handleSubmit} className="budget-form shadow">
        <input type="text" name="category" placeholder="Category" value={formData.category} onChange={handleChange} required disabled={!!editBudgetId} />
        <input type="number" name="limit" placeholder="Limit (₹)" value={formData.limit} onChange={handleChange} required />
        
        <select name="month" value={formData.month} onChange={handleChange} required disabled={!!editBudgetId}>
          <option value="">Select Month</option>
          {months.map((m) => (
            <option key={m.value} value={m.value}>{m.label}</option>
          ))}
        </select>

        <select name="year" value={formData.year} onChange={handleChange} required disabled={!!editBudgetId}>
          <option value="">Select Year</option>
          {years.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>

        <button type="submit" className="btn set-budget-btn">
          {editBudgetId ? "Update Budget" : "Set Budget"}
        </button>
      </form>

      {/* Budget List */}
      <h3 className="text-center mt-4">Your Budgets</h3>
      {budgets.length === 0 ? (
        <p className="text-center text-muted">No budgets set yet.</p>
      ) : (
        <table className="table table-hover mt-3">
          <thead className="bg-dark text-white">
            <tr>
              <th>Category</th>
              <th>Limit</th>
              <th>Month</th>
              <th>Year</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {budgets.map((budget) => (
              <tr key={budget._id}>
                <td>{budget.category}</td>
                <td>₹{budget.limit}</td>
                <td>{months.find((m) => m.value === String(budget.month).padStart(2, "0"))?.label || "N/A"}</td>
                <td>{budget.year}</td>
                <td>
                  <button className="btn btn-warning btn-sm me-2" onClick={() => handleEdit(budget)}>Update</button>
                  <button className="btn btn-danger btn-sm" onClick={() => deleteBudget(budget._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Budget;
