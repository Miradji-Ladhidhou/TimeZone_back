module.exports = (sequelize, DataTypes) => {
  const SoldeConge = sequelize.define("SoldeConge", {
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

    annee: {
      type: DataTypes.INTEGER,
      allowNull: false
    },

    typeConge: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "type_conge"
    },

    acquis: {
      type: DataTypes.FLOAT,
      defaultValue: 0
    },

    utilise: {
      type: DataTypes.FLOAT,
      defaultValue: 0
    },

    restant: {
      type: DataTypes.FLOAT,
      defaultValue: 0
    },

    rollover: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },

    dateMaj: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: "date_maj"
    }
  }, {
    tableName: "soldes_conges",
    timestamps: true
  });

  return SoldeConge;
};
