const { Conge, Utilisateur, Entreprise, DateBloquee, JourFerie, Notification } = require('../models');
const { Op } = require("sequelize");
const { envoyerEmail } = require('../utils/emailService');
const { majSolde } = require('../utils/solde');
const { logAction } = require('../utils/logService');

// ========================
// Helper : calcul jours effectifs (hors fériés non déduits)
// ========================
const calculerJoursEffectifs = async (conge) => {
  const start = new Date(conge.dateDebut);
  const end = new Date(conge.dateFin);
  const diff = (Date.UTC(end.getFullYear(), end.getMonth(), end.getDate()) -
                Date.UTC(start.getFullYear(), start.getMonth(), start.getDate())) / (1000 * 60 * 60 * 24);
  const totalJours = diff >= 0 ? diff + 1 : 0;

  const joursFeries = await JourFerie.findAll({
    where: {
      [Op.or]: [
        { entrepriseId: null },
        { entrepriseId: conge.entrepriseId }
      ],
      date: { [Op.between]: [conge.dateDebut, conge.dateFin] },
      deduireTemps: false
    }
  });

  return totalJours - joursFeries.length;
};

// ========================
// Créer un congé
// ========================
exports.createConge = async (req, res) => {
  try {
    const { dateDebut, dateFin, typeConge } = req.body;
    const utilisateurId = req.user.id;
    const entrepriseId = req.user.entrepriseId;

    // Validation simple
    if (!dateDebut || !dateFin) 
      return res.status(400).json({ error: "Dates invalides" });

    if (new Date(dateFin) < new Date(dateDebut))
      return res.status(400).json({ error: "dateFin doit être après dateDebut" });

    // Vérifier chevauchements congés et dates bloquées
    const chevauchements = await Conge.findAll({
      where: {
        utilisateurId,
        statut: { [Op.in]: ["en_attente", "approuve"] },
        [Op.or]: [
          { dateDebut: { [Op.between]: [dateDebut, dateFin] } },
          { dateFin: { [Op.between]: [dateDebut, dateFin] } },
          { [Op.and]: [{ dateDebut: { [Op.lte]: dateDebut } }, { dateFin: { [Op.gte]: dateFin } }] }
        ]
      }
    });
    if (chevauchements.length > 0) 
      return res.status(400).json({ error: "Chevauchement avec un autre congé" });

    const datesBloquees = await DateBloquee.findAll({
      where: {
        entrepriseId,
        [Op.or]: [
          { dateDebut: { [Op.between]: [dateDebut, dateFin] } },
          { dateFin: { [Op.between]: [dateDebut, dateFin] } },
          { [Op.and]: [{ dateDebut: { [Op.lte]: dateDebut } }, { dateFin: { [Op.gte]: dateFin } }] }
        ]
      }
    });
    if (datesBloquees.length > 0) 
      return res.status(400).json({ error: "Ces dates sont bloquées par l'entreprise" });

    // Vérifier jours fériés interdits
    const joursFeries = await JourFerie.findAll({
      where: {
        [Op.or]: [{ entrepriseId: null }, { entrepriseId: entrepriseId }],
        date: { [Op.between]: [dateDebut, dateFin] }
      }
    });
    if (joursFeries.some(j => j.deduireTemps === false))
      return res.status(400).json({ error: "La période inclut des jours non travaillés (fériés interdits)" });

    // Créer le congé
    const conge = await Conge.create({ utilisateurId, entrepriseId, dateDebut, dateFin, typeConge, statut: "en_attente" });

    // Notifications et emails en parallèle
    const admins = await Utilisateur.findAll({ 
      where: { entrepriseId, role: { [Op.in]: ["admin_entreprise", "manager"] } } 
    });

    await Promise.all(admins.map(async (admin) => {
      if (admin.email) 
        await envoyerEmail(admin.email, "Nouvelle demande de congé", `Nouvelle demande de congé par ${req.user.nom} ${req.user.prenom}.`);
      await Notification.create({ utilisateurId: admin.id, type: "nouveau_conge", message: `Nouvelle demande de congé de ${req.user.nom} ${req.user.prenom}.` });
    }));

    // Log action
    await logAction({
      utilisateurId: req.user.id,
      action: "create",
      tableCible: "Conge",
      elementId: conge.id,
      details: `Demande de congé du ${dateDebut} au ${dateFin}, type: ${typeConge}`
    });

    res.status(201).json(conge);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ========================
// Récupérer tous les congés (filtrage par rôle)
// ========================
exports.getAllConges = async (req, res) => {
  try {
    let where = {};
    if (req.user.role === "employe") {
      where.utilisateurId = req.user.id;
    } else if (["admin_entreprise", "manager"].includes(req.user.role)) {
      where.entrepriseId = req.user.entrepriseId;
    }
    // super_admin voit tout

    const conges = await Conge.findAll({
      where,
      include: [{ model: Utilisateur, attributes: ["nom", "prenom", "email"] }]
    });
    res.json(conges);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ========================
// Mes congés
// ========================
exports.getMesConges = async (req, res) => {
  try {
    const conges = await Conge.findAll({
      where: { utilisateurId: req.user.id },
      include: [{ model: Utilisateur, attributes: ["nom", "prenom", "email"] }]
    });
    res.json(conges);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ========================
// Récupérer un congé par ID
// ========================
exports.getCongeById = async (req, res) => {
  try {
    const conge = await Conge.findByPk(req.params.id, {
      include: [{ model: Utilisateur, attributes: ['nom', 'prenom', 'email'] }]
    });
    if (!conge) return res.status(404).json({ error: "Congé non trouvé" });
    res.json(conge);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ========================
// Mettre à jour un congé
// ========================
exports.updateConge = async (req, res) => {
  try {
    const conge = await Conge.findByPk(req.params.id);
    if (!conge) return res.status(404).json({ error: "Congé non trouvé" });

    const estAdmin = ["super_admin", "admin_entreprise", "manager"].includes(req.user.role);
    if (conge.utilisateurId !== req.user.id && !estAdmin)
      return res.status(403).json({ error: "Accès refusé" });

    const oldCongeData = (({ dateDebut, dateFin, typeConge, statut }) => ({ dateDebut, dateFin, typeConge, statut }))(conge.toJSON());

    await conge.update(req.body);

    // ========================
    //  Log action
    // ========================

    await logAction({
      utilisateurId: req.user.id,
      action: "update",
      tableCible: "Conge",
      elementId: conge.id,
      details: {
        before: oldCongeData,
        after: conge.toJSON()
      }
    });


    res.json(conge);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ========================
// Récupérer le solde
// ========================
exports.getSolde = async (req, res) => {
  try {
    const utilisateurId = req.params.userId;

    // Un employé ne peut voir que son propre solde
    if (req.user.role === "employe" && req.user.id !== parseInt(utilisateurId)) {
      return res.status(403).json({ error: "Accès interdit" });
    }

    const utilisateur = await Utilisateur.findByPk(utilisateurId);
    if (!utilisateur) return res.status(404).json({ error: "Utilisateur non trouvé" });

    const conges = await Conge.findAll({
      where: { utilisateurId, statut: "approuve" }
    });

    const solde = {};
    for (const c of conges) {
      if (!solde[c.typeConge]) solde[c.typeConge] = 0;
      solde[c.typeConge] += await calculerJoursEffectifs(c);
    }

    res.json({ utilisateurId, solde });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ========================
// Alertes congés (prochains congés à gérer)
// ========================
exports.alertesConges = async (req, res) => {
  try {
    const aujourdHui = new Date();
    const alertes = await Conge.findAll({
      where: {
        statut: "en_attente",
        dateDebut: { [Op.lte]: aujourdHui },
      },
      include: [{ model: Utilisateur, attributes: ['nom', 'prenom'] }]
    });
    res.json(alertes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ========================
// Valider un congé
// ========================
exports.validerConge = async (req, res) => {
  try {
    const conge = await Conge.findByPk(req.params.id);
    if (!conge) return res.status(404).json({ error: "Congé non trouvé" });

    const oldCongeData = (({ dateDebut, dateFin, typeConge, statut }) => ({ dateDebut, dateFin, typeConge, statut }))(conge.toJSON());

    const { statut } = req.body;
    conge.statut = statut;
    await conge.save();

    if (statut === "approuve") {
      const jours = await calculerJoursEffectifs(conge);
      await majSolde(conge.utilisateurId, conge.typeConge, jours, "ajout");
    }

    const employe = await Utilisateur.findByPk(conge.utilisateurId);
    if (employe?.email) {
      await envoyerEmail(
        employe.email,
        "Mise à jour de votre demande de congé",
        `Votre demande de congé a été ${statut}.`
      );
    }

    // Créer une notification pour l'employé
    await Notification.create({
      utilisateurId: conge.utilisateurId,
      type: "mise_a_jour_conge",
      message: `Votre demande de congé du ${conge.dateDebut} au ${conge.dateFin} a été ${statut}.`
    });

    // ========================
    //  Log action
    // ========================

    await logAction({
      utilisateurId: req.user.id,
      action: "valider",
      tableCible: "Conge",
      elementId: conge.id,
      details: {
        before: oldCongeData,
        after: conge.toJSON()
      }
    });


    res.json(conge);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ========================
// Supprimer un congé
// ========================
exports.deleteConge = async (req, res) => {
  try {
    const conge = await Conge.findByPk(req.params.id);
    if (!conge) return res.status(404).json({ error: "Congé non trouvé" });

    const estAdmin = ["super_admin", "admin_entreprise"].includes(req.user.role);
    if (conge.utilisateurId !== req.user.id && !estAdmin)
      return res.status(403).json({ error: "Accès refusé" });

    if (conge.statut === "approuve") {
      const jours = await calculerJoursEffectifs(conge);
      await majSolde(conge.utilisateurId, conge.typeConge, jours, "retrait");
    }

    await conge.destroy();

    // Notification de suppression
    await Notification.create({
      utilisateurId: conge.utilisateurId,
      type: "suppression_conge",
      message: `Votre congé du ${conge.dateDebut} au ${conge.dateFin} a été supprimé.`
    });

    // ========================
    //  Log action
    // ========================
    await logAction({
      utilisateurId: req.user.id,
      action: "delete",
      tableCible: "Conge",
      elementId: conge.id,
      details: `Suppression du congé ID ${conge.id}`
    });

    res.json({ message: "Congé supprimé" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
