const express = require("express");
const router = express.Router();
const Action = require("../models/Action");
const Debt = require("../models/Debt");
const joi = require("joi");
const auth = require("../middleware/auth");

const actionBodyValidation = joi.object({
  paymentMethod: joi.string().valid("cash", "visa").required(),
  type: joi
    .string()
    .valid("income", "expense", "transfer", "debtPayment")
    .required(),
  description: joi.string().min(2).required(),
  category: joi.string().valid("games", "weekends", "food", "else").required(),
  transferTo: joi.string().valid("cash", "visa").optional().allow(null),
  debtId: joi.string().when("type", {
    is: "debtPayment",
    then: joi.required(),
    otherwise: joi.optional().allow(null),
  }),
  amount: joi.number().min(0).required(),
});

router.post("/", auth, async (req, res) => {
  try {
    const { error } = actionBodyValidation.validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    let finalAmount = req.body.amount;

    // ===== Debt Payment Logic =====
    if (req.body.type === "debtPayment") {
      const debt = await Debt.findOne({
        _id: req.body.debtId,
        userId: req.user._id,
      });

      if (!debt) return res.status(404).send("Debt not found");

      if (debt.isPaid)
        return res.status(400).send("Debt already paid");

      // Cap payment to remaining debt
      finalAmount = Math.min(req.body.amount, debt.amount);

      debt.amount -= finalAmount;

      if (debt.amount <= 0) {
        debt.amount = 0;
        debt.isPaid = true;
      }

      await debt.save();
    }

    const action = new Action({
      ...req.body,
      amount: finalAmount,
      userId: req.user._id,
    });

    await action.save();

    res.status(201).send(action);
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal server error");
  }
});

router.put("/:id", auth, async (req, res) => {
  try {
    const { error } = actionBodyValidation.validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const action = await Action.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true }
    );

    if (!action) return res.status(404).send("action not found");

    res.status(200).send(action);
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal server error");
  }
});

router.get("/", auth, async (req, res) => {
  try {
    const actions = await Action.find({ userId: req.user._id });
    res.status(200).send(actions);
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal server error");
  }
});

router.get("/:id", auth, async (req, res) => {
  try {
    const action = await Action.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!action) return res.status(404).send("action not found");

    res.status(200).send(action);
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal server error");
  }
});

router.delete("/:id", auth, async (req, res) => {
  try {
    const action = await Action.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!action) return res.status(404).send("action not found");

    res.status(200).send(action);
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal server error");
  }
});

router.patch("/:id", auth, async (req, res) => {
  try {
    const action = await Action.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true }
    );

    if (!action) return res.status(404).send("action not found");

    res.status(200).send(action);
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal server error");
  }
});

module.exports = router;