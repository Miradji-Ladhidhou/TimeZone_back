const { Sequelize } = require("sequelize");
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
const Entreprise = require("./Entreprise")(sequelize);
const Utilisateur = require("./Utilisateur")(sequelize);
const HoraireTravail = require("./HoraireTravail")(sequelize);
const RegleHeuresSupp = require("./RegleHeuresSupp")(sequelize);
const Conge = require("./Conge")(sequelize);
const DateBloquee = require("./DateBloquee")(sequelize);
const Pointage = require("./Pointage")(sequelize);
const JoursFeries = require("./JoursFeries")(sequelize);
const SoldeConge = require("./SoldeConge")(sequelize);
const Notification = require("./Notification")(sequelize);
const LogAction = require("./LogAction")(sequelize);

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
Entreprise.hasMany(RegleHeuresSupp, { foreignKey: "entrepriseId", as: "reglesHeuresSupp", onDelete: "CASCADE" });
RegleHeuresSupp.belongsTo(Entreprise, { foreignKey: "entrepriseId", as: "entreprise" });

// Utilisateur → ReglesHeuresSupp
Utilisateur.hasMany(RegleHeuresSupp, { foreignKey: "utilisateurId", as: "reglesHeuresSupp" });
RegleHeuresSupp.belongsTo(Utilisateur, { foreignKey: "utilisateurId", as: "utilisateur" });

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

// Entreprise → JoursFeries
Entreprise.hasMany(JoursFeries, { foreignKey: "entrepriseId", as: "joursFeries", onDelete: "CASCADE" });
JoursFeries.belongsTo(Entreprise, { foreignKey: "entrepriseId", as: "entreprise" });

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
  RegleHeuresSupp,
  Conge,
  DateBloquee,
  Pointage,
  JoursFeries,
  SoldeConge,
  Notification,
  LogAction,
};
