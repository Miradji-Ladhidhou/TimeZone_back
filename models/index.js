const { Sequelize } = require("sequelize");
require("dotenv").config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    dialect: "postgres",
    logging: false,
  }
);

const Entreprise = require("./Entreprise")(sequelize);
const Utilisateur = require("./Utilisateur")(sequelize);
const HoraireTravail = require("./HoraireTravail")(sequelize);
const RegleHeuresSupp = require("./RegleHeuresSupp")(sequelize);
const Conge = require("./Conge")(sequelize);
const DateBloquee = require("./DateBloquee")(sequelize);
const Pointage = require("./Pointage")(sequelize);

// Associations
Entreprise.hasMany(Utilisateur, { foreignKey: "entrepriseId", as: "utilisateurs", onDelete: "CASCADE" });
Utilisateur.belongsTo(Entreprise, { foreignKey: "entrepriseId", as: "entreprise" });

Entreprise.hasMany(HoraireTravail, { foreignKey: "entrepriseId", as: "horaires", onDelete: "CASCADE" });
HoraireTravail.belongsTo(Entreprise, { foreignKey: "entrepriseId", as: "entreprise" });

Utilisateur.hasMany(HoraireTravail, { foreignKey: "utilisateurId", as: "horaires" });
HoraireTravail.belongsTo(Utilisateur, { foreignKey: "utilisateurId", as: "utilisateur" });

Entreprise.hasMany(RegleHeuresSupp, { foreignKey: "entrepriseId", as: "reglesHeuresSupp", onDelete: "CASCADE" });
RegleHeuresSupp.belongsTo(Entreprise, { foreignKey: "entrepriseId", as: "entreprise" });

Utilisateur.hasMany(RegleHeuresSupp, { foreignKey: "utilisateurId", as: "reglesHeuresSupp" });
RegleHeuresSupp.belongsTo(Utilisateur, { foreignKey: "utilisateurId", as: "utilisateur" });

Entreprise.hasMany(Conge, { foreignKey: "entrepriseId", as: "conges", onDelete: "CASCADE" });
Conge.belongsTo(Entreprise, { foreignKey: "entrepriseId", as: "entreprise" });

Utilisateur.hasMany(Conge, { foreignKey: "utilisateurId", as: "conges" });
Conge.belongsTo(Utilisateur, { foreignKey: "utilisateurId", as: "utilisateur" });

Entreprise.hasMany(DateBloquee, { foreignKey: "entrepriseId", as: "datesBloquees", onDelete: "CASCADE" });
DateBloquee.belongsTo(Entreprise, { foreignKey: "entrepriseId", as: "entreprise" });

Entreprise.hasMany(Pointage, { foreignKey: "entrepriseId", as: "pointages", onDelete: "CASCADE" });
Pointage.belongsTo(Entreprise, { foreignKey: "entrepriseId", as: "entreprise" });

Utilisateur.hasMany(Pointage, { foreignKey: "utilisateurId", as: "pointages" });
Pointage.belongsTo(Utilisateur, { foreignKey: "utilisateurId", as: "utilisateur" });

module.exports = {
  sequelize,
  Sequelize,
  Entreprise,
  Utilisateur,
  HoraireTravail,
  RegleHeuresSupp,
  Conge,
  DateBloquee,
  Pointage,
};
