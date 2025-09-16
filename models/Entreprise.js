module.exports = (sequelize, DataTypes) => {
  const Entreprise = sequelize.define(
    "Entreprise",
    {
      nom: { type: DataTypes.STRING(150), allowNull: false },
      email: { type: DataTypes.STRING(150), allowNull: false },
      telephone: { type: DataTypes.STRING(50) },
      adresse: { type: DataTypes.TEXT },
      pays: { type: DataTypes.STRING(100) },
      fuseauHoraire: {
        type: DataTypes.STRING(50),
        defaultValue: "Europe/Paris",
        field: "fuseau_horaire"
      },
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
