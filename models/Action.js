const mongoose = require("mongoose");

const actionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    paymentMethod: {
      type: String,
      enum: ["cash", "visa"],
      required: true,
    },

    type: {
      type: String,
      enum: ["income", "expense", "transfer", "debtPayment"],
      required: true,
    },

    description: {
      type: String,
      required: true,
      minlength: 2,
      trim: true,
    },

    category: {
      type: String,
      enum: ["games", "weekends", "food", "else"],
      required: true,
    },

    transferTo: {
      type: String,
      enum: ["cash", "visa"],
      default: null,
    },

    debtId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Debt",
      default: null,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    isTransferred: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

actionSchema.index({ userId: 1, createdAt: -1 });

const Action = mongoose.model("Action", actionSchema);
module.exports = Action;
