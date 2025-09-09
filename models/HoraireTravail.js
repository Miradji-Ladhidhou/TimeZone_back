module.exports = (sequelize, DataTypes) => {
  const HoraireTravail = sequelize.define(
    "HoraireTravail",
    {
      entrepriseId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'entreprise_id',
        references: {
          model: 'entreprises',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },

      utilisateurId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'utilisateur_id',
        references: {
          model: 'utilisateurs',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },

      jourSemaine: {
        type: DataTypes.SMALLINT,
        allowNull: false,
        field: "jour_semaine",
        validate: { min: 0, max: 6 },
        comment: "0=Dimanche ... 6=Samedi",
      },

      heureDebut: {
        type: DataTypes.TIME,
        allowNull: false,
        field: "heure_debut"
      },

      heureFin: {
        type: DataTypes.TIME,
        allowNull: false,
        field: "heure_fin"
      },

      dureePause: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: "duree_pause"
      },
    },
    {
      tableName: "horaires_travail",
      timestamps: true,
      underscored: true,
      indexes: [
        { fields: ["entreprise_id", "utilisateur_id", "jour_semaine"], unique: true },
        { fields: ["entreprise_id"] },
      ],
    }
  );

  return HoraireTravail;
};
