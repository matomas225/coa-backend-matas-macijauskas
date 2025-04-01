const express = require("express");
const mongoose = require("mongoose");

const app = express();

mongoose
  .connect("mongodb://127.0.0.1:27017/myDatabase")
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Could not connect to MongoDB...", err));

const cors = require("cors");

const corsOptions = {
  origin: "http://localhost:5173",
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

app.get("/", (req, res) => {
  res.send("Success ");
});

app.get("/data", (req, res) => {
  res.json({ data: ["item1", "item2", "item3"] });
});

const userSchema = mongoose.Schema({
  age: Number,
  lastName: String,
  movies: [String],
  name: String,
});

const userModel = mongoose.model("users", userSchema);

app.get("/getUsers", async (req, res) => {
  try {
    const users = await userModel.find();
    res.json(users);
  } catch (err) {
    res.json(err);
  }
});

app.listen(3000, () => console.log("Backend running on port: 3000"));
