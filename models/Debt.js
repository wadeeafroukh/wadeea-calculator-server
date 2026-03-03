const mongoose = require("mongoose");

const debtSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      minlength: 2,
      trim: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    isPaid: {
      type: Boolean,
      default: false,
    },

    category: {
      type: String,
      enum: ["family", "vehicles", "study", "else"],
      required: true,
    },
  },
  { timestamps: true },
);

debtSchema.index({ userId: 1, createdAt: -1 });


const Debt = mongoose.model("Debt", debtSchema);
module.exports = Debt;
