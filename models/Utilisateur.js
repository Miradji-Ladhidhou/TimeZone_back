const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Utilisateur = sequelize.define(
    "Utilisateur",
    {
      nom: { type: DataTypes.STRING(100), allowNull: false },
      prenom: { type: DataTypes.STRING(100) },
      email: { type: DataTypes.STRING(150), allowNull: false, unique: true, validate: { isEmail: true } },
      mot_de_passe: { type: DataTypes.STRING, allowNull: false },
      role: { type: DataTypes.ENUM("super_admin", "admin_entreprise", "manager", "employe"), defaultValue: "employe" },
      actif: { type: DataTypes.BOOLEAN, defaultValue: true },
      date_embauche: { type: DataTypes.DATEONLY },
      entrepriseId: { type: DataTypes.INTEGER, allowNull: false },
    },
    {
      tableName: "utilisateurs",
      timestamps: true,
      underscored: true,
      defaultScope: {
        attributes: { exclude: ["mot_de_passe"] },
      },
      scopes: {
        withPassword: {},
        byEntreprise(entrepriseId) {
          return { where: { entrepriseId } };
        },
      },
      indexes: [{ fields: ["entreprise_id"] }, { unique: true, fields: ["email"] }],
    }
  );

  return Utilisateur;
};
