import React from "react";

const BudgetProgressBar = ({ totalBudget, usedBudget }) => {
  const percentageUsed = (usedBudget / totalBudget) * 100;

  return (
    <div className="w-full bg-gray-300 rounded-full h-6 overflow-hidden">
      <div
        className="bg-blue-500 h-full text-center text-white text-sm"
        style={{ width: `${percentageUsed}%` }}
      >
        {Math.round(percentageUsed)}%
      </div>
    </div>
  );
};

export default BudgetProgressBar;
