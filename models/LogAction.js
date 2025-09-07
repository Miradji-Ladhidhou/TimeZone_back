const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const LogAction = sequelize.define(
    "LogAction",
    {
      utilisateurId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "utilisateur_id",
        references: { model: "utilisateurs", key: "id" },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },

      action: {
        type: DataTypes.STRING(150),
        allowNull: false,
      },

      tableCible: {
        type: DataTypes.STRING(50),
        field: "table_cible",
      },

      elementId: {
        type: DataTypes.INTEGER,
        field: "element_id",
      },

      details: {
        type: DataTypes.JSONB,
        allowNull: true,
      },

      dateAction: {
        type: DataTypes.DATE,
        field: "date_action",
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "logs_actions",
      timestamps: false,
      underscored: true,
      indexes: [{ fields: ["utilisateur_id"] }],
    }
  );

  return LogAction;
};
