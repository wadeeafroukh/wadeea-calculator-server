const express = require("express");
const Action = require("../models/Action");
const Debt = require("../models/Debt");
const auth = require("../middleware/auth");
const router = express.Router();

router.get("/", auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - 6);
    startOfWeek.setHours(0, 0, 0, 0);
    const weeklyActions = await Action.find({
      userId,
      createdAt: { $gte: startOfWeek, $lte: now },
    });

    const weeklyStats = weeklyActions.reduce(
      (acc, action) => {
        if (action.type === "income") {
          acc.totalIncome += action.amount;
        }
        if (action.type === "expense" || action.type === "debtPayment") {
          acc.totalExpense += action.amount;
        }
        return acc;
      },
      { totalIncome: 0, totalExpense: 0 },
    );
    weeklyStats.net = weeklyStats.totalIncome - weeklyStats.totalExpense;
    const monthlyActions = await Action.find({
      userId,
      createdAt: { $gte: startOfMonth, $lte: now },
    });
    const monthlyStats = monthlyActions.reduce(
      (acc, action) => {
        if (action.type === "income") {
          acc.totalIncome += action.amount;
        }
        if (action.type === "expense" || action.type === "debtPayment") {
          acc.totalExpense += action.amount;
        }
        return acc;
      },
      { totalIncome: 0, totalExpense: 0 },
    );
    monthlyStats.net = monthlyStats.totalIncome - monthlyStats.totalExpense;
    res.status(200).send({ weeklyStats, monthlyStats });
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal server error");
  }
});

module.exports = router;
