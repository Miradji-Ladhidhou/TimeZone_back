module.exports = (sequelize, DataTypes) => {
  const Pointage = sequelize.define(
    "Pointage",
    {
      entrepriseId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'entreprise_id',
        references: {
          model: 'entreprises',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },

      utilisateurId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'utilisateur_id',
        references: {
          model: 'utilisateurs',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },

      datePointage: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        field: 'date_pointage'
      },

      heureEntree: {
        type: DataTypes.TIME,
        allowNull: false,
        field: 'heure_entree'
      },

      heureSortie: {
        type: DataTypes.TIME,
        allowNull: true,
        field: 'heure_sortie'
      },

      heuresTravaillees: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'heures_travaillees'
      },

      heuresSupp: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: 'heures_supp'
      },
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
          return { where: { datePointage: { [Op.between]: [start, end] } } };
        },
      },
    },

  );

  return Pointage;
};
