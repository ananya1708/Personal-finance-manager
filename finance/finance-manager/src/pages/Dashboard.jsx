import { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import DoughnutChart from "../componenets/DoughnutChart";
import LineChart from "../componenets/LineChart";
import TransactionsTable from "../componenets/TransactionsTable";
import Sidebar from "../componenets/Sidebar";
import { Container, Row, Col, Card, Spinner, Alert } from "react-bootstrap";
import "../styles/Dashboard.css";

const Dashboard = () => {
  // Initialize with empty state to force dynamic updates
  const [summary, setSummary] = useState({ balance: 0, totalIncome: 0, totalExpense: 0 });
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [monthlyLoading, setMonthlyLoading] = useState(false);
  const [budgetExceeded, setBudgetExceeded] = useState(false);
  const [budgetExceededMessage, setBudgetExceededMessage] = useState("");
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [monthlyTransactions, setMonthlyTransactions] = useState([]);

  const userId = localStorage.getItem("userId");

  const fetchSummary = useCallback(async () => {
    if (!userId) return;
    try {
      const { data } = await axios.get(`http://localhost:5000/api/transactions/summary/${userId}`);
      setSummary(data || { balance: 0, totalIncome: 0, totalExpense: 0 });
    } catch (error) {
      console.error("Error fetching summary:", error);
    }
  }, [userId]);

  const fetchTransactions = useCallback(async () => {
    if (!userId) return;
    try {
      const { data } = await axios.get(`http://localhost:5000/api/transactions/${userId}`);
      console.log("Fetched transactions:", data);
      setTransactions(data || []);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  }, [userId]);

  const fetchBudgets = useCallback(async () => {
    if (!userId) return;
    try {
      setMonthlyLoading(true);
      const month = String(currentMonth).padStart(2, "0");
      
      const response = await axios.get(`http://localhost:5000/api/budget/${userId}/${month}/${currentYear}`);
      console.log("Budgets fetched:", response.data);
      
      const fetchedBudgets = Array.isArray(response.data) ? response.data : [];
      setBudgets(fetchedBudgets);
      setMonthlyLoading(false);
    } catch (error) {
      console.error("Error fetching budgets:", error);
      setBudgets([]);
      setMonthlyLoading(false);
    }
  }, [userId, currentMonth, currentYear]);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    Promise.all([fetchSummary(), fetchTransactions(), fetchBudgets()]).finally(() => setLoading(false));
  }, [fetchSummary, fetchTransactions, fetchBudgets, userId]);

  useEffect(() => {
    if (!userId || loading) return;
    fetchBudgets();
  }, [currentMonth, currentYear, fetchBudgets, loading, userId]);

  // Filter transactions for the current month and update monthly transactions state
  useEffect(() => {
    if (!transactions || !Array.isArray(transactions)) {
      setMonthlyTransactions([]);
      return;
    }
    
    const filtered = transactions.filter(transaction => {
      if (!transaction || !transaction.date) {
        return false;
      }
      
      const transDate = new Date(transaction.date);
      return (
        transDate.getMonth() + 1 === currentMonth && 
        transDate.getFullYear() === currentYear
      );
    });
    
    console.log(`Filtered ${filtered.length} transactions for ${currentMonth}/${currentYear}`);
    setMonthlyTransactions(filtered);
  }, [transactions, currentMonth, currentYear]);

  const calculateSpentPerCategory = useCallback(() => {
    console.log("Calculating spent per category from transactions:", monthlyTransactions);
    
    const spentByCategory = {};
    
    monthlyTransactions.forEach(transaction => {
      if (transaction.type === 'expense' || Number(transaction.amount) < 0) {
        const category = (transaction.category || 'Other').trim();
        const amount = Math.abs(Number(transaction.amount) || 0);
        
        if (!spentByCategory[category]) {
          spentByCategory[category] = 0;
        }
        
        spentByCategory[category] += amount;
        console.log(`Added ${amount} to ${category}, total now: ${spentByCategory[category]}`);
      }
    });
    
    console.log("Final spent per category:", spentByCategory);
    return spentByCategory;
  }, [monthlyTransactions]);

  const combinedBudgets = useMemo(() => {
    if (!budgets.length) return [];
    
    const spentPerCategory = calculateSpentPerCategory();
    console.log("Category spending calculated:", spentPerCategory);
    
    const result = budgets.map((budget) => {
      const category = (budget.category || '').trim();
      const budgetLimit = Number(budget.limit) || 0;
      
      let spent = 0;
      const exactMatch = spentPerCategory[category];
      
      if (exactMatch !== undefined) {
        spent = exactMatch;
        console.log(`Exact match found for ${category}: ${spent}`);
      } else {
        const lowerCategory = category.toLowerCase();
        const matchingCategory = Object.keys(spentPerCategory).find(
          cat => cat.toLowerCase() === lowerCategory
        );
        
        if (matchingCategory) {
          spent = spentPerCategory[matchingCategory];
          console.log(`Case-insensitive match found for ${category}: ${spent}`);
        } else {
          console.log(`No spending found for category: ${category}`);
        }
      }
      
      const remaining = Math.max(0, budgetLimit - spent);
      
      console.log(`Budget for ${category}: Limit=${budgetLimit}, Spent=${spent}, Remaining=${remaining}`);
      
      return {
        ...budget,
        amount: budgetLimit,
        totalSpent: spent,
        remaining: remaining,
      };
    });
    
    console.log("Combined budgets with spending:", result);
    return result;
  }, [budgets, calculateSpentPerCategory]);

  useEffect(() => {
    let exceeded = false;
    let message = "";

    combinedBudgets.forEach((budget) => {
      if (budget.totalSpent > budget.amount) {
        exceeded = true;
        message += `🚨 Budget Exceeded for ${budget.category}! (Limit: ₹${budget.amount}, Spent: ₹${budget.totalSpent.toFixed(2)})\n`;
      }
    });

    setBudgetExceeded(exceeded);
    setBudgetExceededMessage(message);
  }, [combinedBudgets]);

  const handleMonthChange = (increment) => {
    let newMonth = currentMonth + increment;
    let newYear = currentYear;
    
    if (newMonth > 12) {
      newMonth = 1;
      newYear += 1;
    } else if (newMonth < 1) {
      newMonth = 12;
      newYear -= 1;
    }
    
    setCurrentMonth(newMonth);
    setCurrentYear(newYear);
  };

  const getMonthName = (month) => {
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    return monthNames[month - 1];
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-content">
        <Container className="dashboard-container">
          <h1 className="dashboard-title">Dashboard</h1>

          {loading ? (
            <div className="loading-container">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
            </div>
          ) : (
            <>
              {budgetExceeded && (
                <Alert variant="danger" className="budget-alert">
                  <strong>{budgetExceededMessage}</strong>
                </Alert>
              )}

              <Row className="summary-cards">
                <Col md={4}>
                  <Card className="summary-card balance-card">
                    <Card.Body>
                      <div className="summary-header">
                        <span className="summary-icon">💰</span>
                        <Card.Title>Total Balance</Card.Title>
                      </div>
                      <Card.Text className="summary-amount">₹ {summary.balance}</Card.Text>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={4}>
                  <Card className="summary-card income-card">
                    <Card.Body>
                      <div className="summary-header">
                        <span className="summary-icon">📈</span>
                        <Card.Title>Total Income</Card.Title>
                      </div>
                      <Card.Text className="summary-amount">₹ {summary.totalIncome}</Card.Text>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={4}>
                  <Card className="summary-card expense-card">
                    <Card.Body>
                      <div className="summary-header">
                        <span className="summary-icon">📉</span>
                        <Card.Title>Total Expenses</Card.Title>
                      </div>
                      <Card.Text className="summary-amount">₹ {summary.totalExpense}</Card.Text>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              <Row className="mt-4">
                <Col md={6}>
                  <div className="chart-container">
                    <h4 className="chart-title">Income vs Expenses</h4>
                    <div className="chart-wrapper">
                      <DoughnutChart transactions={transactions} />
                    </div>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="chart-container">
                    <h4 className="chart-title">Monthly Income</h4>
                    <div className="chart-wrapper">
                      <LineChart transactions={transactions} />
                    </div>
                  </div>
                </Col>
              </Row>

              <div className="budget-navigation">
                <button className="budget-nav-button" onClick={() => handleMonthChange(-1)}>
                  &lt; Previous
                </button>
                <h3 className="budget-month-title">{getMonthName(currentMonth)} {currentYear} Budgets</h3>
                <button className="budget-nav-button" onClick={() => handleMonthChange(1)}>
                  Next &gt;
                </button>
              </div>

              {monthlyLoading ? (
                <div className="budget-loading">
                  <Spinner animation="border" role="status" size="sm">
                    <span className="visually-hidden">Loading...</span>
                  </Spinner>
                  <span className="ms-2">Loading budget data...</span>
                </div>
              ) : (
                <Row>
                  {combinedBudgets.length > 0 ? (
                    combinedBudgets.map((budget, index) => (
                      <Col md={4} key={index} className="mb-3">
                        <Card className="budget-card">
                          <Card.Body>
                            <Card.Title className="budget-card-title">{budget.category}</Card.Title>
                            <div className="budget-details">
                              <div className="budget-amount-row">💰 Budget: ₹{budget.amount.toFixed(2)}</div>
                              <div className="budget-amount-row budget-spent">🛍 Spent: ₹{budget.totalSpent.toFixed(2)}</div>
                              <div className="budget-amount-row">💎 Remaining: ₹{budget.remaining.toFixed(2)}</div>
                            </div>
                            <div className="progress mt-2">
                              <div 
                                className={`progress-bar ${budget.totalSpent > budget.amount ? 'bg-danger' : 'bg-success'}`} 
                                role="progressbar" 
                                style={{ width: `${budget.amount === 0 ? 0 : Math.min((budget.totalSpent / budget.amount) * 100, 100)}%` }}
                              >
                                {budget.amount === 0 ? 0 : Math.round((budget.totalSpent / budget.amount) * 100)}%
                              </div>
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>
                    ))
                  ) : (
                    <Col>
                      <div className="budget-empty-state">
                        <p>No budgets found for {getMonthName(currentMonth)} {currentYear}.</p>
                        <a href="/budget" className="btn create-budget-button">Create a Budget</a>
                      </div>
                    </Col>
                  )}
                </Row>
              )}

              <h2 className="section-title">Recent Transactions</h2>
              <TransactionsTable transactions={transactions} />
            </>
          )}
        </Container>
      </div>
    </div>
  );
};

export default Dashboard;
