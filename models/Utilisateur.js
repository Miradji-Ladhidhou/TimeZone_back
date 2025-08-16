const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Utilisateur = sequelize.define(
    "Utilisateur",
    {
      nom: { type: DataTypes.STRING(100), allowNull: false },
      prenom: { type: DataTypes.STRING(100) },
      email: { type: DataTypes.STRING(150), allowNull: false, validate: { isEmail: true } },
      mot_de_passe: { type: DataTypes.STRING, allowNull: false },
      role: {
        type: DataTypes.ENUM("super_admin", "admin_entreprise", "manager", "employe"),
        defaultValue: "employe",
      },
      actif: { type: DataTypes.BOOLEAN, defaultValue: true },
      date_embauche: { type: DataTypes.DATEONLY },
      entrepriseId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "entreprises", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
    },
    {
      tableName: "utilisateurs",
      timestamps: true,
      underscored: true,
      defaultScope: {
        attributes: { exclude: ["mot_de_passe"] }, // sécurité par défaut
      },
      scopes: {
        withPassword: { attributes: {} }, // inclut tout (pour login uniquement)
        byEntreprise(entrepriseId) { return { where: { entrepriseId } }; },
      },
      indexes: [
        { fields: ["entreprise_id"] },
        { unique: true, fields: ["email", "entreprise_id"] }, // email unique dans l’entreprise
      ],
    }
  );

  Utilisateur.associate = (models) => {
    Utilisateur.belongsTo(models.Entreprise, { foreignKey: "entrepriseId", as: "entreprise" });
  };

  return Utilisateur;
};
