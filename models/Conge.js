module.exports = (sequelize, DataTypes) => {
  const Conge = sequelize.define(
    "Conge",
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
      },

      utilisateurId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "utilisateur_id",
        references: {
          model: "utilisateurs",
          key: "id"
        },
        onDelete: "CASCADE"
      },

      typeConge: {
        type: DataTypes.ENUM("CP", "RTT", "Sans solde", "Maladie", "Maternité", "Paternité"),
        field: "type_conge",
        defaultValue: "CP",
      },

      dateDebut: { type: DataTypes.DATEONLY, 
      allowNull: false,
      field: "date_debut" },

      dateFin: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        field: "date_fin",
        validate: {
          isAfterStart(value) {
            if (this.dateDebut && value < this.dateDebut) {
              throw new Error("dateFin ne peut pas être avant dateDebut");
            }
          },
        }
      },

      statut: {
        type: DataTypes.ENUM("en_attente", "approuve", "refuse"),
        defaultValue: "en_attente"
      },
      
      commentaire: { type: DataTypes.TEXT },

      dateDemande: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        defaultValue: sequelize.literal("CURRENT_DATE"),
        field: "date_demande",
      }

    },
    {
      tableName: "conges",
      timestamps: true,
      underscored: true,
      indexes: [
        { fields: ["entreprise_id", "utilisateur_id", "date_debut", "date_fin"] },
        { fields: ["utilisateur_id"] },
      ],
    }
  );

  return Conge;
};
