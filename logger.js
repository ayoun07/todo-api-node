const winston = require("winston");

const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(), // C'est ici que la magie "structurée" opère
  transports: [
    new winston.transports.Console(),
    // Optionnel : on peut aussi enregistrer dans un fichier
    new winston.transports.File({ filename: "error.log", level: "error" }),
  ],
});

module.exports = logger;
