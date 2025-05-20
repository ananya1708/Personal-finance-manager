const express = require("express");
const router = express.Router();
const Budget = require("../models/Budget");

// ✅ Debugging Log: Confirm route file is loaded
console.log("✅ Budget Routes Loaded!");

// ✅ Set Budget for a Category
router.post("/set", async (req, res) => {
  try {
    console.log("🔹 Received POST request to /set");
    console.log("Request Body:", req.body);

    const { userId, category, limit, month, year } = req.body;

    // ✅ Check if required fields are provided
    if (!userId || !category || !limit || !month || !year) {
      console.log("❌ Missing required fields");
      return res.status(400).json({ message: "All fields are required!" });
    }

    let budget = await Budget.findOne({ userId, category, month, year });

    if (budget) {
      console.log("❌ Budget already exists for this category");
      return res.status(400).json({ message: "Budget already set for this category in this month and year!" });
    }

    budget = new Budget({ userId, category, limit, month, year });
    await budget.save();
    console.log("✅ Budget saved successfully!");

    res.status(201).json({ message: "Budget set successfully!", budget });
  } catch (error) {
    console.error("❌ Server error:", error.message);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
});

// ✅ Fetch User's Budget by Month & Year
router.get("/:userId/:month/:year", async (req, res) => {
  try {
    console.log("🔹 Received GET request to fetch budget");
    const { userId, month, year } = req.params;
    const budgets = await Budget.find({ userId, month, year });

    res.json(budgets);
  } catch (error) {
    console.error("❌ Server error:", error.message);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
});

// ✅ Update Budget for a Category
router.put("/:budgetId", async (req, res) => {
  try {
    console.log("🔹 Received PUT request to update budget");
    const { limit } = req.body;
    const budget = await Budget.findByIdAndUpdate(
      req.params.budgetId,
      { limit },
      { new: true }
    );

    if (!budget) {
      console.log("❌ Budget not found");
      return res.status(404).json({ message: "Budget not found" });
    }

    console.log("✅ Budget updated successfully!");
    res.json({ message: "Budget updated successfully", budget });
  } catch (error) {
    console.error("❌ Server error:", error.message);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
});

// ✅ Delete a Budget
router.delete("/:budgetId", async (req, res) => {
  try {
    console.log("🔹 Received DELETE request to remove budget with ID:", req.params.budgetId);

    const budget = await Budget.findById(req.params.budgetId);

    if (!budget) {
      console.log("❌ Budget not found");
      return res.status(404).json({ message: "Budget not found" });
    }

    await Budget.findByIdAndDelete(req.params.budgetId);
    console.log("✅ Budget deleted successfully!");

    res.json({ message: "Budget deleted successfully!" });
  } catch (error) {
    console.error("❌ Server error:", error.message);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
});


module.exports = router;
