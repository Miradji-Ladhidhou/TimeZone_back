const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Utilisateur = sequelize.define(
    "Utilisateur",
    {
      nom: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      prenom: {
        type: DataTypes.STRING(100),
      },
      email: {
        type: DataTypes.STRING(150),
        allowNull: false,
        validate: { isEmail: true },
      },
      mot_de_passe: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      role: {
        type: DataTypes.ENUM("super_admin", "admin_entreprise", "manager", "employe"),
        defaultValue: "employe",
      },
      actif: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      date_embauche: {
        type: DataTypes.DATEONLY,
      },
      entrepriseId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "entreprises", // nom de la table
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
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
        withPassword: {
          attributes: {},
        },
        byEntreprise(entrepriseId) {
          return { where: { entrepriseId } };
        },
      },
      indexes: [
        { fields: ["entreprise_id"] },
        // Si tu veux permettre le même email dans plusieurs entreprises
        { unique: true, fields: ["email", "entreprise_id"] },
      ],
    }
  );

  Utilisateur.associate = (models) => {
    Utilisateur.belongsTo(models.Entreprise, {
      foreignKey: "entrepriseId",
      as: "entreprise",
    });
  };

  return Utilisateur;
};
