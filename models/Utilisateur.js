module.exports = (sequelize, DataTypes) => {
  const Utilisateur = sequelize.define(
    "Utilisateur",
    {
      nom: { type: DataTypes.STRING(100), allowNull: false },

      prenom: { type: DataTypes.STRING(100), allowNull: false },

      email: { type: DataTypes.STRING(150), allowNull: false, validate: { isEmail: true } },

      motDePasse: {
        type: DataTypes.STRING,
        allowNull: false,
        field: "mot_de_passe",
      },

      role: {
        type: DataTypes.ENUM("super_admin", "admin_entreprise", "manager", "employe"),
        defaultValue: "employe",
        allowNull: false,
      },

      actif: { type: DataTypes.BOOLEAN, defaultValue: true },

      entrepriseId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "entreprise_id",
        references: { model: "entreprises", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },

      dateCreation: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: "date_creation",
      },
    },
    {
      tableName: "utilisateurs",
      timestamps: true,
      underscored: true,
      defaultScope: {
        attributes: { exclude: ["mot_de_passe"] }, 
      },
      scopes: {
        withPassword: { attributes: {} }, 
        byEntreprise(entrepriseId) { return { where: { entrepriseId } }; },
      },
      indexes: [
        { fields: ["entreprise_id"] },
        { unique: true, fields: ["email", "entreprise_id"] }, 
      ],
    }
  );

  return Utilisateur;
};
