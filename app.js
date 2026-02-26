require("dotenv").config();
const Sentry = require("@sentry/node");

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
});
const logger = require("./logger");
const express = require("express");
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const todoRouter = require("./routes/todo");
const helmet = require("helmet");

const app = express();
app.use(helmet());
app.use(express.json());

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Todo API",
      version: "1.0.0",
      description: "Une API simple de gestion de tâches avec SQLite",
    },
    servers: [
      { url: "http://localhost:3000" },
      { url: "https://mon-api.onrender.com" },
    ],
  },
  apis: ["./routes/*.js"],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.get("/", (_req, res) => {
  logger.info("someone hit the root endpoint");
  res.json({ message: "Welcome to the Enhanced Express Todo App!" });
});

app.use("/todos", todoRouter);

if(require.main === module){
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () =>
    logger.info(`Server running on http://localhost:${PORT}`),
  );
}

module.exports = app;
