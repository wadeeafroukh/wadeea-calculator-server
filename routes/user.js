// routes/users.js
const express = require("express");
const router = express.Router();
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const joi = require("joi");
const bcrypt = require("bcrypt");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

// ========== Joi Validations ==========
const registerBodyValidation = joi.object({
  name: joi.object({
    first: joi.string().min(2).max(255).required(),
    last: joi.string().min(2).max(255).required(),
  }),
  phone: joi
    .string()
    .pattern(/^(?:\+972|0)5\d{8}$/)
    .required(),
  image: joi.string().min(6).max(1024).optional().allow(""),
  address: joi.object({
    state: joi.string().min(2).max(255).optional().allow(""),
    country: joi.string().min(2).max(255).required(),
    city: joi.string().min(2).max(255).optional().allow(""),
    street: joi.string().min(2).max(255),
    houseNumber: joi.number().required().positive(),
    zip: joi.number().required().positive(),
  }),
  email: joi.string().min(6).max(55).required().email(),
  password: joi.string().min(6).max(30).required(),
});

const loginBodyValidation = joi.object({
  email: joi.string().min(6).max(255).required().email(),
  password: joi.string().min(6).max(1024).required(),
});

const userBodyValidation = joi.object({
  name: joi.object({
    first: joi.string().min(2).max(255).required(),
    last: joi.string().min(2).max(255).required(),
  }),
  phone: joi
    .string()
    .pattern(/^(?:\+972|0)5\d{8}$/)
    .required(),
  address: joi.object({
    state: joi.string().min(2).max(255).optional().allow(""),
    country: joi.string().min(2).max(255).required(),
    city: joi.string().min(2).max(255).optional().allow(""),
    street: joi.string().min(2).max(255),
    houseNumber: joi.number().required().positive(),
    zip: joi.number().required().positive(),
  }),
});

// ========== Register ==========
router.post("/", async (req, res) => {
  try {
    const { error } = registerBodyValidation.validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    let user = await User.findOne({ email: req.body.email });
    if (user) return res.status(400).send("User already exists");

    user = new User(req.body);

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);

    await user.save();

    const token = jwt.sign(
      { _id: user._id, isAdmin: user.isAdmin },
      process.env.JWTKEY,
    );

    res.status(201).send(token);
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
});

// ========== Login ==========
router.post("/login", async (req, res) => {
  try {
    const { error } = loginBodyValidation.validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(400).send("Wrong email or password");

    const validPass = await bcrypt.compare(req.body.password, user.password);
    if (!validPass) return res.status(400).send("Wrong email or password");

    const token = jwt.sign(
      { _id: user._id, isAdmin: user.isAdmin },
      process.env.JWTKEY,
    );

    res.status(200).send(token);
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
});

// ========== Admin: Get all users ==========
router.get("/", auth, admin, async (req, res) => {
  try {
    const users = await User.find().select("-password -__v");
    res.status(200).send(users);
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
});

// ========== Admin: Get user by id ==========
router.get("/:id", auth, admin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password -__v");
    if (!user) return res.status(404).send("User not found");
    res.status(200).send(user);
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
});

// ========== Update user (admin OR same user) ==========
router.put("/:id", auth, async (req, res) => {
  try {
    if (!req.user.isAdmin && req.user._id !== req.params.id)
      return res.status(403).send("Access denied");

    const { error } = userBodyValidation.validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    }).select("-password -__v");

    if (!updatedUser) return res.status(404).send("User not found");

    res.status(200).send(updatedUser);
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
});

// ========== Admin: Delete user ==========
router.delete("/:id", auth, admin, async (req, res) => {
  try {
    const deleted = await User.findByIdAndDelete(req.params.id).select(
      "-password -__v",
    );
    if (!deleted) return res.status(404).send("User not found");
    res.status(200).send(deleted);
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
});

// ========== Patch user (admin OR same user) ==========
router.patch("/:id", auth, async (req, res) => {
  try {
    if (!req.user.isAdmin && req.user._id !== req.params.id)
      return res.status(403).send("Access denied");

    const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    }).select("-password -__v");

    if (!updatedUser) return res.status(404).send("User not found");
    res.status(200).send(updatedUser);
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
