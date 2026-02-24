require("dotenv").config();
const express = require("express");
const { router } = require("./routes/todo");

const SECRET_KEY = process.env.SECRET_KEY;
const API_KEY = process.env.API_KEY;

const app = express();
app.use(express.json());

app.get("/", (_req, res) => {
  console.log("someone hit the root endpoint");
  res.json({ message: "Welcome to the Enhanced Express Todo App!" });
});

// debug endpoint
app.get("/debug", (_req, res) => {
  res.json({ secret: SECRET_KEY, api_key: API_KEY, env: process.env });
});

app.use("/todos", router);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`),
);

module.exports = app;
