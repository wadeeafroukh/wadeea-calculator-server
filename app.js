const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
const userRoute = require("./routes/user");
const actionRoute = require("./routes/action");
const statsRoute = require("./routes/stats");
const debtsRoute = require("./routes/debt");
const port = process.env.PORT || 8000;
require("dotenv").config();

mongoose
  .connect(process.env.DB)
  .then(() => console.log("connected to db"))
  .catch((err) => console.log(err));

app.use(cors());
app.use(express.json());

app.use("/api/users", userRoute);
app.use("/api/actions", actionRoute);
app.use("/api/debts", debtsRoute);
app.use("/api/stats", statsRoute);

app.listen(port, () => console.log(`Server is running on port ${port}`));
