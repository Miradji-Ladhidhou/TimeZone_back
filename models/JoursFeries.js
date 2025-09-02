const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const JoursFeries = sequelize.define(
    'JoursFeries',
    {
      entrepriseId: { type: DataTypes.INTEGER, allowNull: false },
      date: { type: DataTypes.DATEONLY, allowNull: false },
      description: { type: DataTypes.STRING, allowNull: true },
    },
    {
      tableName: 'jours_feries',
      timestamps: true,
      underscored: true,
      indexes: [
        { fields: ['entreprise_id', 'date'], unique: true },
        { fields: ['entreprise_id'] },
      ],
    }
  );

  return JoursFeries;
}