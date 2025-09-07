const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const JoursFeries = sequelize.define(
    'JoursFeries',
    {
      entrepriseId: { type: DataTypes.INTEGER,
         allowNull: false,
         field: 'entreprise_id',
         references: {
           model: 'entreprises',
           key: 'id'
         },
         onUpdate: 'CASCADE',
         onDelete: 'CASCADE',
      },

      date: { type: DataTypes.DATEONLY, allowNull: false },

      label : { type: DataTypes.STRING(150), allowNull: false },

      type : { type: DataTypes.ENUM('National', 'Régional', 'Spécifique'), allowNull: false, defaultValue: 'National' },

      obligatoire : { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },

      deduireTemps : {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        field: 'deduire_temps',
        comment: 'Indique si le jour férié doit être déduit du temps de travail (true) ou non (false)'
      }
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