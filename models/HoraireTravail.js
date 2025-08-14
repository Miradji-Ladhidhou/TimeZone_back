const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const HoraireTravail = sequelize.define(
    "HoraireTravail",
    {
      entrepriseId: { type: DataTypes.INTEGER, allowNull: false },
      utilisateurId: { type: DataTypes.INTEGER, allowNull: true }, 
      jour_semaine: {
        type: DataTypes.SMALLINT,
        allowNull: false,
        validate: { min: 0, max: 6 },
        comment: "0=Dimanche ... 6=Samedi",
      },
      heure_debut: { type: DataTypes.TIME, allowNull: false },
      heure_fin: { type: DataTypes.TIME, allowNull: false },
      duree_pause_min: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 }, 
    },
    {
      tableName: "horaires_travail",
      timestamps: true,
      underscored: true,
      indexes: [
        { fields: ["entreprise_id", "utilisateur_id", "jour_semaine"], unique: true },
        { fields: ["entreprise_id"] },
      ],
    }
  );

  return HoraireTravail;
};
