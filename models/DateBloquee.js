module.exports = (sequelize, DataTypes) => {
  const DateBloquee = sequelize.define(
    "DateBloquee",
    {
      entrepriseId: { 
        type: DataTypes.INTEGER, 
        allowNull: false,
        field : "entreprise_id",
        references: {
          model: "entreprises",
          key: "id"
        },
        onDelete: "CASCADE",
      },

      dateDebut: { 
        type: DataTypes.DATEONLY, 
        allowNull: false,
        field : "date_debut"
      },

      dateFin: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        field : "date_fin",
        validate: {
          isAfterStart(value) {
            if (this.dateDebut && value < this.dateDebut) {
              throw new Error("dateFin ne peut pas être avant dateDebut");
            }
          },
        },
      },

      raison: { 
        type: DataTypes.TEXT,
        validate: { len: [0, 500] }
      },
    },
    {
      tableName: "dates_bloquees",
      timestamps: true,
      underscored: true,
      indexes: [{ fields: ["entreprise_id", "date_debut", "date_fin"] }],
    }
  );

  return DateBloquee;
};
