const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const RegleHeuresSupp = sequelize.define(
    "RegleHeuresSupp",
    {
      entrepriseId: { type: DataTypes.INTEGER, allowNull: false },
      utilisateurId: { type: DataTypes.INTEGER, allowNull: true }, 
      seuil_journalier_min: { type: DataTypes.INTEGER, defaultValue: 420 }, 
      taux_majoration_pct: { type: DataTypes.DECIMAL(5, 2), defaultValue: 25.0 }, 
    },
    {
      tableName: "regles_heures_supp",
      timestamps: true,
      underscored: true,
      indexes: [{ fields: ["entreprise_id", "utilisateur_id"] }],
    }
  );

  return RegleHeuresSupp;
};
