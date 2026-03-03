const express = require("express");
const router = express.Router();
const Debt = require("../models/Debt");
const joi = require("joi");
const auth = require("../middleware/auth");
const debtBodyValidation = joi.object({
  name: joi.string().min(2).required(),
  amount: joi.number().min(0).required(),
  isPaid: joi.boolean().optional(),
  category: joi
    .string()
    .valid("family", "vehicles", "study", "else")
    .required(),
});

router.post("/", auth, async (req, res) => {
  try {
    const { error } = debtBodyValidation.validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    const debt = new Debt({ ...req.body, userId: req.user._id });
    await debt.save();
    res.status(201).send(debt);
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal server error");
  }
});

router.put("/:id", auth, async (req, res) => {
  try {
    const { error } = debtBodyValidation.validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    let debt = await Debt.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      {
        new: true,
      },
    );
    if (!debt) return res.status(404).send("debt not found");

    res.status(200).send(debt);
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal server error");
  }
});

router.get("/", auth, async (req, res) => {
  try {
    const debts = await Debt.find({ userId: req.user._id });

    res.status(200).send(debts);
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal server error");
  }
});

router.get("/:id", auth, async (req, res) => {
  try {
    const debt = await Debt.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (!debt) return res.status(404).send("debt not found");
    res.status(200).send(debt);
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal server error");
  }
});

router.delete("/:id", auth, async (req, res) => {
  try {
    const debt = await Debt.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (!debt) return res.status(404).send("debt not found");
    res.status(200).send(debt);
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal server error");
  }
});

router.patch("/:id", auth, async (req, res) => {
  try {
    const debt = await Debt.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      {
        new: true,
      },
    );
    if (!debt) return res.status(404).send("debt not found");
    res.status(200).send(debt);
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal server error");
  }
});

module.exports = router;
