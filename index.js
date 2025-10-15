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
app.use(
  cors({
    origin: process.env.CORS_ALLOWED_ORIGINS ? process.env.CORS_ALLOWED_ORIGINS.split(',') : ["http://localhost:5173"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

const userRoutes = require("./src/routes/userRoutes");
app.use("/users", userRoutes);

const songRoutes = require("./src/routes/songRoutes");
app.use("/songs", songRoutes);

const albumRoutes = require("./src/routes/albumRoutes");
app.use("/albums", albumRoutes);

app.get("/", (req, res) => {
  res.send("Success ");
});

const PORT = process.env.BACKEND_PORT || 3001;
app.listen(PORT, () => console.log(`Backend running on port: ${PORT}`));
