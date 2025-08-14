const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Entreprise = require("./Entreprise");

const Utilisateur = sequelize.define("Utilisateur", {
  nom: { type: DataTypes.STRING, allowNull: false },
  prenom: { type: DataTypes.STRING },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  mot_de_passe: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.STRING, defaultValue: "employe" },
  actif: { type: DataTypes.BOOLEAN, defaultValue: true },
  date_embauche: { type: DataTypes.DATE }
}, { timestamps: true });

Utilisateur.belongsTo(Entreprise, { foreignKey: "entrepriseId" });
Entreprise.hasMany(Utilisateur, { foreignKey: "entrepriseId" });

module.exports = Utilisateur;
