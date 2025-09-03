module.exports = (sequelize, DataTypes) => {
  const SoldeConge = sequelize.define("SoldeConge", {
    utilisateurId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    typeConge: {
      type: DataTypes.STRING,
      allowNull: false
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
    }
  }, {
    tableName: "soldes_conges",
    timestamps: true
  });

  SoldeConge.associate = (models) => {
    SoldeConge.belongsTo(models.Utilisateur, {
      foreignKey: "utilisateurId",
      onDelete: "CASCADE"
    });
  };

  return SoldeConge;
};
