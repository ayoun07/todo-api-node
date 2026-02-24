require('dotenv').config();
const express = require('express');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const todoRouter = require('./routes/todo');

const app = express(); // 1. On crée l'app d'abord !
app.use(express.json());

// --- Configuration Swagger ---
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Todo API',
      version: '1.0.0',
      description: 'Une API simple de gestion de tâches avec SQLite',
    },
    servers: [
      { url: 'http://localhost:3000' },
      { url: 'https://mon-api.onrender.com' },
    ],
  },
  apis: ['./routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
// -----------------------------

const SECRET_KEY = process.env.SECRET_KEY;
const API_KEY = process.env.API_KEY;

app.get('/', (_req, res) => {
  console.log('someone hit the root endpoint');
  res.json({ message: 'Welcome to the Enhanced Express Todo App!' });
});

// Attention : Cet endpoint expose tes secrets !
// À supprimer avant de donner l'URL à quelqu'un.
app.get('/debug', (_req, res) => {
  res.json({ secret: SECRET_KEY, api_key: API_KEY });
});

app.use('/todos', todoRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`),
);

module.exports = app;
