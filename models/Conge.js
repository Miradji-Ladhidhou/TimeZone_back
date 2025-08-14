const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Conge = sequelize.define(
    "Conge",
    {
      entrepriseId: { type: DataTypes.INTEGER, allowNull: false },
      utilisateurId: { type: DataTypes.INTEGER, allowNull: false },
      type_conge: {
        type: DataTypes.ENUM("CP", "RTT", "Sans solde", "Maladie", "Maternité", "Paternité"),
        defaultValue: "CP",
      },
      date_debut: { type: DataTypes.DATEONLY, allowNull: false },
      date_fin: { type: DataTypes.DATEONLY, allowNull: false,
        validate: {
          isAfterStart(value) {
            if (this.date_debut && value < this.date_debut) {
              throw new Error("date_fin ne peut pas être avant date_debut");
            }
          },
        }
      },
      statut: { type: DataTypes.ENUM("en_attente", "approuve", "refuse"), defaultValue: "en_attente" },
      commentaire: { type: DataTypes.TEXT },
    },
    {
      tableName: "conges",
      timestamps: true,
      underscored: true,
      indexes: [
        { fields: ["entreprise_id", "utilisateur_id", "date_debut", "date_fin"] },
        { fields: ["utilisateur_id"] },
      ],
      scopes: {
        byEntreprise(entrepriseId) { return { where: { entrepriseId } }; },
        byUser(utilisateurId) { return { where: { utilisateurId } }; },
        between(start, end) { return { where: { date_debut: { [require("sequelize").Op.lte]: end }, date_fin: { [require("sequelize").Op.gte]: start } } }; },
      },
    }
  );

  return Conge;
};
