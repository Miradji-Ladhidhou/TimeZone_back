const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const DateBloquee = sequelize.define(
    "DateBloquee",
    {
      entrepriseId: { type: DataTypes.INTEGER, allowNull: false },
      date_debut: { type: DataTypes.DATEONLY, allowNull: false },
      date_fin: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        validate: {
          isAfterStart(value) {
            if (this.date_debut && value < this.date_debut) {
              throw new Error("date_fin ne peut pas être avant date_debut");
            }
          },
        },
      },
      raison: { type: DataTypes.TEXT },
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
