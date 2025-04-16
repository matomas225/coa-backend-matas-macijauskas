require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

const { mongoURI } = require("./src/config/db");

mongoose
  .connect(mongoURI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Could not connect to MongoDB...", err));

app.use(express.json());

const corsOptions = require("./src/middleware/corsOptions");
app.use(cors(corsOptions));

const userRoutes = require("./src/routes/userRoutes");
app.use("/users", userRoutes);

const musicRoutes = require("./src/routes/musicRoutes");
app.use("/songs", musicRoutes);

app.get("/", (req, res) => {
  res.send("Success ");
});

app.listen(3000, () => console.log("Backend running on port: 3000"));
