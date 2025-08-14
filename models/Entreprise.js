const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Entreprise = sequelize.define("Entreprise", {
  nom: { type: DataTypes.STRING, allowNull: false },
  adresse: { type: DataTypes.TEXT },
  pays: { type: DataTypes.STRING },
  fuseau_horaire: { type: DataTypes.STRING, defaultValue: "Europe/Paris" }
}, { timestamps: true });

module.exports = Entreprise;
