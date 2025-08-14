const express = require("express");
const cors = require("cors");
const sequelize = require("./config/database");
const authRoutes = require("./routes/auth");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);

sequelize.authenticate()
  .then(() => console.log("PostgreSQL connecté"))
  .catch(err => console.log("Erreur DB:", err));

module.exports = app;
