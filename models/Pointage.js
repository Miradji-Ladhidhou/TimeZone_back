const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Pointage = sequelize.define(
    "Pointage",
    {
      entrepriseId: { type: DataTypes.INTEGER, allowNull: false },
      utilisateurId: { type: DataTypes.INTEGER, allowNull: false },
      date_pointage: { type: DataTypes.DATEONLY, allowNull: false },
      heure_entree: { type: DataTypes.DATE }, // timestamp réel si tu uploade depuis une pointeuse
      heure_sortie: { type: DataTypes.DATE },
      heures_travaillees_min: { type: DataTypes.INTEGER, allowNull: true }, // calculé côté service
      heures_supp_min: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    },
    {
      tableName: "pointages",
      timestamps: true,
      underscored: true,
      indexes: [
        { unique: true, fields: ["utilisateur_id", "date_pointage"] },
        { fields: ["entreprise_id", "utilisateur_id", "date_pointage"] },
      ],
      scopes: {
        byEntreprise(entrepriseId) { return { where: { entrepriseId } }; },
        byUser(utilisateurId) { return { where: { utilisateurId } }; },
        between(start, end) {
          const { Op } = require("sequelize");
          return { where: { date_pointage: { [Op.between]: [start, end] } } };
        },
      },
    }
  );

  return Pointage;
};
