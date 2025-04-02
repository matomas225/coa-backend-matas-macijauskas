const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

const { mongoURI } = require("./src/config/db");
mongoose
  .connect(mongoURI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Could not connect to MongoDB...", err));

const corsOptions = require("./src/middleware/corsOptions");
app.use(cors(corsOptions));

const userRoutes = require("./src/routes/userRoutes");
app.use("/users", userRoutes);

app.get("/", (req, res) => {
  res.send("Success ");
});

app.get("/data", (req, res) => {
  res.json({ data: ["item1", "item2", "item3"] });
});

app.listen(3000, () => console.log("Backend running on port: 3000"));
