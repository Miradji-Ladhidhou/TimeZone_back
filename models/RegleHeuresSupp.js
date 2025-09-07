const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const RegleHeuresSupp = sequelize.define(
    "RegleHeuresSupp",
    {
      entrepriseId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "entreprise_id",
        references: {
          model: "entreprises",
          key: "id"
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE"
      },

      utilisateurId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: "utilisateur_id",
        references: {
          model: "utilisateurs",
          key: "id"
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE"
      },

      seuilJournalier: {
        type: DataTypes.INTEGER,
        defaultValue: 420,
        allowNull: false,
        field: "seuil_journalier"
      },

      tauxMajoration: {
        type: DataTypes.DECIMAL(5, 2),
        defaultValue: 25.0,
        allowNull: false,
        field: "taux_majoration"
      },
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
