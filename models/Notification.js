module.exports = (sequelize, DataTypes) => {
  const Notification = sequelize.define("Notification", {
    type: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false
    },

    lu: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },

    dateCreation: {
      type: DataTypes.DATE,
      field: "date_creation",
      defaultValue: DataTypes.NOW
    },

    utilisateurId: {
      type: DataTypes.INTEGER,
      field: "utilisateur_id",
      references: {
        model: "utilisateurs",
        key: "id"
      },
      onDelete: "CASCADE"
    }
  }, {
    tableName: "notifications",
    timestamps: false,
    indexes: [
      {
        fields: ["utilisateur_id"]
      }
    ]
  }
  );

  return Notification;
};
