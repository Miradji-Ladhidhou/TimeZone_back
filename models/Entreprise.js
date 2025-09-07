const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Entreprise = sequelize.define(
    "Entreprise",
    {
      nom: { type: DataTypes.STRING(150), allowNull: false },
      adresse: { type: DataTypes.TEXT },
      pays: { type: DataTypes.STRING(100) },
      fuseau_horaire: { type: DataTypes.STRING(50), defaultValue: "Europe/Paris" },
    },
    {
      tableName: "entreprises",
      timestamps: true,
      underscored: true,
      indexes: [{ fields: ["nom"] }],
    }
  );

  return Entreprise;
};
