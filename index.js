const express = require("express");
const app = express();
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

app.listen(3000, () => console.log("Backend running on port: 3000"));
