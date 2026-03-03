const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    first: { type: String, required: true },
    last: { type: String, required: true },
  },
  phone: { type: String, required: true },
  email: { type: String, required: true, minLength: 6, unique: true },
  password: { type: String, required: true, minLength: 7 },
  address: {
    street: { type: String, required: true },
    country: { type: String, required: true },
    city: { type: String },
    state: { type: String },
    houseNumber: { type: String },
    zip: { type: String, required: true },
  },
  isAdmin: { type: Boolean, default: false },
});
const User = mongoose.model("User", userSchema);
module.exports = User;
