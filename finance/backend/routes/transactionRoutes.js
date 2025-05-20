const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const cors = require("cors");
const Transaction = require("../models/Transaction");
const Budget = require("../models/Budget");

// ✅ Function to check if userId is a valid MongoDB ObjectId
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// ✅ Add a new transaction (with detailed logs)
router.post("/add", async (req, res) => {
  try {
    console.log("\n=== 🔹 Incoming Transaction Request ===");
    console.log("Request Body:", req.body);

    const { userId, type, category, amount } = req.body;
    const amountNum = Number(amount); // Convert amount to number

    console.log("🔍 Checking userId:", userId);

    // ✅ Check if userId is valid
    if (!isValidObjectId(userId)) {
      console.log("❌ Invalid userId format!");
      return res.status(400).json({ message: "❌ Invalid userId format!" });
    }

    const userObjectId = new mongoose.Types.ObjectId(userId); // Convert to ObjectId

    console.log("✅ Valid userId. Converted to ObjectId:", userObjectId);

    if (type === "expense") {
      console.log("🔍 Checking budget for category:", category);
      const budget = await Budget.findOne({ userId: userObjectId, category });

      if (!budget) {
        console.log(`⚠ No budget found for category: ${category}`);
      } else {
        console.log("✅ Budget Found:", budget);

        // ✅ Aggregation to calculate total expense
        console.log("🔍 Calculating total expenses for this category...");
        const totalExpense = await Transaction.aggregate([
          { $match: { userId: userObjectId, category, type: "expense" } },
          { $group: { _id: null, total: { $sum: "$amount" } } },
        ]);

        const currentExpense = totalExpense.length ? totalExpense[0].total : 0;
        const budgetLimit = Number(budget.limit);
        const newTotal = currentExpense + amountNum;

        console.log(`📊 Budget: ${budgetLimit}, Spent: ${currentExpense}, New Total: ${newTotal}`);

        if (newTotal > budgetLimit) {
          console.log("🚨 Budget exceeded, transaction rejected.");
          return res.status(400).json({
            message: `⚠ Budget exceeded for ${category}. Limit: ${budgetLimit}, Spent: ${currentExpense}, Trying to Add: ${amountNum}`,
          });
        }
      }
    }

    console.log("✅ Creating new transaction...");
    const transaction = new Transaction({
      userId: userObjectId,
      type,
      category,
      amount: amountNum,
    });

    await transaction.save();
    console.log("✅ Transaction saved successfully!", transaction);

    return res.status(201).json({ message: "✅ Transaction added successfully!", transaction });
  } catch (error) {
    console.error("❌ Error:", error.message);
    return res.status(500).json({ message: error.message });
  }
});

// ✅ Get all transactions for a user
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    console.log("\n=== 🔹 Fetching Transactions for User ===");
    console.log("🔍 Checking userId:", userId);

    if (!isValidObjectId(userId)) {
      console.log("❌ Invalid userId format!");
      return res.status(400).json({ message: "❌ Invalid userId format!" });
    }

    console.log("✅ Valid userId. Fetching transactions...");
    const transactions = await Transaction.find({ userId }).sort({ date: -1 });

    console.log("✅ Transactions Found:", transactions);
    res.json(transactions);
  } catch (error) {
    console.error("❌ Error fetching transactions:", error.message);
    res.status(500).json({ message: error.message });
  }
});

// ✅ Delete a transaction
router.delete("/:transactionId", async (req, res) => {
  try {
    console.log("\n=== 🔹 Deleting Transaction ===");
    console.log("Transaction ID:", req.params.transactionId);

    await Transaction.findByIdAndDelete(req.params.transactionId);
    console.log("✅ Transaction deleted successfully!");
    
    res.json({ message: "✅ Transaction deleted successfully!" });
  } catch (error) {
    console.error("❌ Error deleting transaction:", error.message);
    res.status(500).json({ message: error.message });
  }
});

// ✅ Update a transaction
router.put("/:transactionId", async (req, res) => {
  try {
    console.log("\n=== 🔹 Updating Transaction ===");
    console.log("Transaction ID:", req.params.transactionId);
    console.log("New Data:", req.body);

    const { type, category, amount } = req.body;
    const transaction = await Transaction.findByIdAndUpdate(
      req.params.transactionId,
      { type, category, amount },
      { new: true }
    );

    if (!transaction) {
      console.log("❌ Transaction not found!");
      return res.status(404).json({ message: "❌ Transaction not found" });
    }

    console.log("✅ Transaction updated successfully!", transaction);
    res.json({ message: "✅ Transaction updated successfully!", transaction });
  } catch (error) {
    console.error("❌ Error updating transaction:", error.message);
    res.status(500).json({ message: error.message });
  }
});

// ✅ Get transaction summary for a user
router.get("/summary/:userId", async (req, res) => {
  try {
    console.log("\n=== 🔹 Fetching Summary for User ===");
    console.log("User ID:", req.params.userId);

    const { userId } = req.params;

    if (!isValidObjectId(userId)) {
      console.log("❌ Invalid userId format!");
      return res.status(400).json({ message: "❌ Invalid userId format!" });
    }

    console.log("✅ Valid userId. Fetching summary...");
    const transactions = await Transaction.find({ userId });

    let totalIncome = 0;
    let totalExpense = 0;

    transactions.forEach((transaction) => {
      if (transaction.type === "income") {
        totalIncome += transaction.amount;
      } else if (transaction.type === "expense") {
        totalExpense += transaction.amount;
      }
    });

    console.log("📊 Summary: ", { totalIncome, totalExpense, balance: totalIncome - totalExpense });
    res.json({ totalIncome, totalExpense, balance: totalIncome - totalExpense });
  } catch (error) {
    console.error("❌ Error fetching summary:", error.message);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
