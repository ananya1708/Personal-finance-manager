import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { CSVLink } from "react-csv";
import { jsPDF } from "jspdf";
import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/Transaction.css";

const API_BASE_URL = "http://localhost:5000/api/transactions";
const BUDGET_API_URL = "http://localhost:5000/api/budget";

const Transaction = () => {
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({ totalIncome: 0, totalExpense: 0, balance: 0 });
  const [formData, setFormData] = useState({ type: "expense", category: "", amount: "" });
  const [budget, setBudget] = useState(null); // Set budget to null initially
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const userId = localStorage.getItem("userId");

  const fetchBudget = useCallback(async () => {
    if (!userId) return;
    
    const currentDate = new Date();
    const month = currentDate.getMonth() + 1;
    const year = currentDate.getFullYear();

    try {
      const response = await axios.get(`${BUDGET_API_URL}/${userId}/${month}/${year}`);
      console.log("Budget API Response:", response.data); // Debugging output
      setBudget(response.data.budget ?? null); // Ensure budget is null if not set
    } catch (error) {
      console.error("Error fetching budget:", error);
      setError("Error fetching budget.");
    }
  }, [userId]);


  const fetchTransactions = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/${userId}`);
      setTransactions(response.data || []);
    } catch (error) {
      setError("Error fetching transactions.");
    }
    setLoading(false);
  }, [userId]);

  const fetchSummary = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/summary/${userId}`);
      setSummary(response.data || { totalIncome: 0, totalExpense: 0, balance: 0 });
    } catch (error) {
      setError("Error fetching summary.");
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    if (!userId) {
      setError("No valid user ID found! Please log in again.");
      return;
    }
    fetchBudget();
    fetchTransactions();
    fetchSummary();
  }, [userId, fetchBudget, fetchTransactions, fetchSummary]);

  const handleSaveTransaction = async (e) => {
    e.preventDefault();
    const transactionAmount = Number(formData.amount);
  
    if (!userId || !formData.category.trim() || transactionAmount <= 0) {
      setError("Please enter a valid category and amount.");
      return;
    }
  
    if (formData.type === "expense" && budget !== null) {
      const categoryBudget = budget[formData.category] || 0; // Get category budget
      const categorySpent = summary.categoryExpenses[formData.category] || 0; // Get spent amount
  
      if (categorySpent + transactionAmount > categoryBudget) {
        setError(`Budget exceeded for ${formData.category}. Limit: ${categoryBudget}, Spent: ${categorySpent}, Trying to Add: ${transactionAmount}`);
        return;
      }
    }
  
    try {
      console.log("Sending transaction data:", { userId, ...formData });
      const response = await axios.post(`${API_BASE_URL}/add`, { userId, ...formData });
  
      console.log("Transaction saved successfully!", response.data);
      setFormData({ type: "expense", category: "", amount: "" });
      setError("");
      fetchTransactions();
      fetchSummary();
      fetchBudget();
    } catch (error) {
      console.error("Error saving transaction:", error.response?.data || error.message);
      setError(error.response?.data?.message || "Error saving transaction. Please try again.");
    }
  };
  
  

  const handleDeleteTransaction = async (transactionId) => {
    if (!userId) return;
    try {
      await axios.delete(`${API_BASE_URL}/${transactionId}`);
      fetchTransactions();
      fetchSummary();
    } catch (error) {
      setError("Error deleting transaction.");
    }
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("Transaction Summary", 10, 10);
    let y = 20;
    transactions.forEach((txn) => {
      doc.text(`${txn.type.toUpperCase()} - ${txn.category}: ₹${txn.amount}`, 10, y);
      y += 10;
    });
    doc.save("transactions.pdf");
  };

  const csvData = transactions.map((txn) => ({
    Type: txn.type,
    Category: txn.category,
    Amount: `₹${txn.amount}`,
  }));

  return (
    <div className="transaction-container">
      <h2 className="title">Transaction Summary</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      {loading ? (
        <p className="loading-text">Loading transactions...</p>
      ) : (
        <>
          <div className="summary-card">
            <h5 className="income">Total Income: ₹{summary.totalIncome?.toFixed(2)}</h5>
            <h5 className="expense">Total Expense: ₹{summary.totalExpense?.toFixed(2)}</h5>
            <h5 className="balance">Balance: ₹{summary.balance?.toFixed(2)}</h5>
            <h5 className="budget">Budget: {budget !== null ? `₹${budget?.toFixed(2)}` : "Not Set"}</h5>
          </div>

          <h3 className="title">Add Transaction</h3>
          <form className="transaction-form" onSubmit={handleSaveTransaction}>
            <select
              className="form-control"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            >
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
            <input
              type="text"
              className="form-control"
              placeholder="Category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              required
            />
            <input
              type="number"
              className="form-control"
              placeholder="Amount"
              min="0"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              required
            />
            <button type="submit" className="submit-btn">Add</button>
          </form>

          <h3 className="title">Transactions</h3>
          {transactions.length === 0 ? (
            <p className="no-transactions">No transactions found.</p>
          ) : (
            <table className="transaction-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Category</th>
                  <th>Amount</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr key={transaction._id}>
                    <td>{transaction.type}</td>
                    <td>{transaction.category}</td>
                    <td>₹{parseFloat(transaction.amount).toFixed(2)}</td>
                    <td>
                      <button className="delete-btn" onClick={() => handleDeleteTransaction(transaction._id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <div className="export-buttons">
            <CSVLink data={csvData} filename={"transactions.csv"} className="btn btn-success">
              Export CSV
            </CSVLink>
            <button onClick={generatePDF} className="btn btn-danger">
              Export PDF
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Transaction;
