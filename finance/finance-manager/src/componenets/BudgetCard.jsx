import React, { useState, useEffect } from "react";
import { Card, ProgressBar, Alert } from "react-bootstrap";
import "./BudgetCard.css"; // Import the CSS for animation

const BudgetCard = ({ budget }) => {
  const { category, limit, spent } = budget;
  const remaining = limit - spent;
  const isOverBudget = spent > limit;
  const progress = Math.min((spent / limit) * 100, 100); // Limit to 100%

  const [showAlert, setShowAlert] = useState(isOverBudget);

  useEffect(() => {
    if (isOverBudget) {
      setShowAlert(true);
      const timer = setTimeout(() => setShowAlert(false), 4000); // Hide after 4 sec
      return () => clearTimeout(timer);
    }
  }, [isOverBudget]);

  return (
    <>
      {/* Slide-in Alert */}
      {showAlert && (
        <Alert variant="danger" className="slide-in-alert">
          🚨 Budget Exceeded! You have spent ₹{spent} out of ₹{limit}.
        </Alert>
      )}

      <Card className={`mb-3 shadow-sm border-${isOverBudget ? "danger" : "success"}`}>
        <Card.Body className="text-center">
          <Card.Title className="fw-bold text-primary">{category}</Card.Title>

          <ProgressBar
            now={progress}
            variant={isOverBudget ? "danger" : "success"}
            label={`${progress.toFixed(0)}%`}
            className="mt-2"
          />

          <div className="mt-3">
            <p className="mb-1">
              <strong>Budget:</strong> ₹{limit}
            </p>
            <p className={`mb-1 ${isOverBudget ? "text-danger fw-bold" : "text-dark"}`}>
              <strong>Spent:</strong> ₹{spent}
            </p>
            <p className={`${isOverBudget ? "text-danger" : "text-success fw-bold"}`}>
              <strong>Remaining:</strong> ₹{remaining < 0 ? 0 : remaining}
            </p>
          </div>
        </Card.Body>
      </Card>
    </>
  );
};

export default BudgetCard;
