const { Sequelize, DataTypes } = require("sequelize");
require("dotenv").config();

// Connexion à la base de données
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

// Import des modèles
const Entreprise = require("./Entreprise")(sequelize, DataTypes);
const Utilisateur = require("./Utilisateur")(sequelize, DataTypes);
const HoraireTravail = require("./HoraireTravail")(sequelize, DataTypes);
const RegleHeureSupp = require("./RegleHeureSupp")(sequelize, DataTypes);
const Conge = require("./Conge")(sequelize, DataTypes);
const DateBloquee = require("./DateBloquee")(sequelize, DataTypes);
const Pointage = require("./Pointage")(sequelize, DataTypes);
const JourFerie = require("./JourFerie")(sequelize, DataTypes);
const SoldeConge = require("./SoldeConge")(sequelize, DataTypes);
const Notification = require("./Notification")(sequelize, DataTypes);
const LogAction = require("./LogAction")(sequelize, DataTypes);

// ========================
// Associations
// ========================

// Entreprise → Utilisateurs
Entreprise.hasMany(Utilisateur, { foreignKey: "entrepriseId", as: "utilisateurs", onDelete: "CASCADE" });
Utilisateur.belongsTo(Entreprise, { foreignKey: "entrepriseId", as: "entreprise" });

// Entreprise → HorairesTravail
Entreprise.hasMany(HoraireTravail, { foreignKey: "entrepriseId", as: "horaires", onDelete: "CASCADE" });
HoraireTravail.belongsTo(Entreprise, { foreignKey: "entrepriseId", as: "entreprise" });

// Utilisateur → HorairesTravail
Utilisateur.hasMany(HoraireTravail, { foreignKey: "utilisateurId", as: "horaires" });
HoraireTravail.belongsTo(Utilisateur, { foreignKey: "utilisateurId", as: "utilisateur" });

// Entreprise → ReglesHeuresSupp
Entreprise.hasMany(RegleHeureSupp, { foreignKey: "entrepriseId", as: "reglesHeuresSupp", onDelete: "CASCADE" });
RegleHeureSupp.belongsTo(Entreprise, { foreignKey: "entrepriseId", as: "entreprise" });

// Utilisateur → ReglesHeuresSupp
Utilisateur.hasMany(RegleHeureSupp, { foreignKey: "utilisateurId", as: "reglesHeuresSupp" });
RegleHeureSupp.belongsTo(Utilisateur, { foreignKey: "utilisateurId", as: "utilisateur" });

// Entreprise → Conges
Entreprise.hasMany(Conge, { foreignKey: "entrepriseId", as: "conges", onDelete: "CASCADE" });
Conge.belongsTo(Entreprise, { foreignKey: "entrepriseId", as: "entreprise" });

// Utilisateur → Conges
Utilisateur.hasMany(Conge, { foreignKey: "utilisateurId", as: "conges" });
Conge.belongsTo(Utilisateur, { foreignKey: "utilisateurId", as: "utilisateur" });

// Entreprise → DatesBloquees
Entreprise.hasMany(DateBloquee, { foreignKey: "entrepriseId", as: "datesBloquees", onDelete: "CASCADE" });
DateBloquee.belongsTo(Entreprise, { foreignKey: "entrepriseId", as: "entreprise" });

// Entreprise → Pointages
Entreprise.hasMany(Pointage, { foreignKey: "entrepriseId", as: "pointages", onDelete: "CASCADE" });
Pointage.belongsTo(Entreprise, { foreignKey: "entrepriseId", as: "entreprise" });

// Utilisateur → Pointages
Utilisateur.hasMany(Pointage, { foreignKey: "utilisateurId", as: "pointages" });
Pointage.belongsTo(Utilisateur, { foreignKey: "utilisateurId", as: "utilisateur" });

// Entreprise → JourFerie
Entreprise.hasMany(JourFerie, { foreignKey: "entrepriseId", as: "JourFerie", onDelete: "CASCADE" });
JourFerie.belongsTo(Entreprise, { foreignKey: "entrepriseId", as: "entreprise" });

// Utilisateur → SoldeConge
Utilisateur.hasMany(SoldeConge, { foreignKey: "utilisateurId", as: "soldesConge", onDelete: "CASCADE" });
SoldeConge.belongsTo(Utilisateur, { foreignKey: "utilisateurId", as: "utilisateur" });

// Utilisateur → Notifications
Utilisateur.hasMany(Notification, { foreignKey: "utilisateurId", as: "notifications", onDelete: "CASCADE" });
Notification.belongsTo(Utilisateur, { foreignKey: "utilisateurId", as: "utilisateur" });

// Utilisateur → LogActions
Utilisateur.hasMany(LogAction, { foreignKey: "utilisateurId", as: "logsActions", onDelete: "CASCADE" });
LogAction.belongsTo(Utilisateur, { foreignKey: "utilisateurId", as: "utilisateur" });

module.exports = {
  sequelize,
  Entreprise,
  Utilisateur,
  HoraireTravail,
  RegleHeureSupp,
  Conge,
  DateBloquee,
  Pointage,
  JourFerie,
  SoldeConge,
  Notification,
  LogAction,
};
