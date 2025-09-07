const { Conge, Utilisateur, Entreprise, DatesBloquee, JoursFeries } = require('../models');
const { Op } = require("sequelize");
const { envoyerEmail } = require('../utils/emailService');
const { majSolde } = require('../utils/solde');
const { Notification } = require('../models');

// ========================
// Helper : calcul jours effectifs (hors fériés non déduits)
// ========================
const calculerJoursEffectifs = async (conge) => {
  const totalJours = Math.ceil(
    (new Date(conge.date_fin) - new Date(conge.date_debut)) / (1000 * 60 * 60 * 24)
  ) + 1;

  const joursFeries = await JoursFeries.findAll({
    where: {
      [Op.or]: [
        { entrepriseId: null },
        { entrepriseId: conge.entrepriseId }
      ],
      date: { [Op.between]: [conge.date_debut, conge.date_fin] },
      deduire_temps: false
    }
  });

  return totalJours - joursFeries.length;
};

// ========================
// Créer un congé
// ========================
exports.createConge = async (req, res) => {
  try {
    const { date_debut, date_fin, typeConge } = req.body;
    const utilisateurId = req.user.id;
    const entrepriseId = req.user.entrepriseId;

    // ========================
    //  Vérifier chevauchements avec les autres congés
    // ========================
    const chevauchements = await Conge.findAll({
      where: {
        utilisateurId,
        statut: { [Op.in]: ["en_attente", "approuve"] },
        [Op.or]: [
          { date_debut: { [Op.between]: [date_debut, date_fin] } },
          { date_fin: { [Op.between]: [date_debut, date_fin] } },
          {
            [Op.and]: [
              { date_debut: { [Op.lte]: date_debut } },
              { date_fin: { [Op.gte]: date_fin } }
            ]
          }
        ]
      }
    });

    if (chevauchements.length > 0)
      return res.status(400).json({ error: "Chevauchement avec un autre congé" });

    // ========================
    //  Vérifier chevauchements avec les dates bloquées
    // ========================
    const datesBloquees = await DatesBloquee.findAll({
      where: {
        entrepriseId,
        [Op.or]: [
          { date_debut: { [Op.between]: [date_debut, date_fin] } },
          { date_fin: { [Op.between]: [date_debut, date_fin] } },
          {
            [Op.and]: [
              { date_debut: { [Op.lte]: date_debut } },
              { date_fin: { [Op.gte]: date_fin } }
            ]
          }
        ]
      }
    });

    if (datesBloquees.length > 0)
      return res.status(400).json({ error: "Ces dates sont bloquées par l'entreprise" });

    // ========================
    //  Vérifier jours fériés interdits
    // ========================
    const joursFeries = await JoursFeries.findAll({
      where: {
        [Op.or]: [
          { entrepriseId: null },
          { entrepriseId }
        ],
        date: { [Op.between]: [date_debut, date_fin] }
      }
    });

    if (joursFeries.some(j => j.deduire_temps === false))
      return res.status(400).json({ error: "La période inclut des jours non travaillés (fériés interdits)" });

    // ========================
    //  Créer le congé
    // ========================
    const conge = await Conge.create({
      utilisateurId,
      entrepriseId,
      date_debut,
      date_fin,
      typeConge,
      statut: "en_attente"
    });

    // ========================
    //  Notification aux admins/managers
    // ========================
    const admins = await Utilisateur.findAll({
      where: {
        entrepriseId,
        role: { [Op.in]: ["admin_entreprise", "manager"] }
      }
    });

    for (const admin of admins) {
      if (admin.email) {
        await envoyerEmail(
          admin.email,
          "Nouvelle demande de congé",
          `Une nouvelle demande de congé a été soumise par ${req.user.nom} ${req.user.prenom}.`
        );
      }
    }

    // Créer une notification dans la base de données
    for (const admin of admins) {
      await Notification.create({
        utilisateur_id: admin.id,
        type: "nouveau_conge",
        message: `Nouvelle demande de congé de ${req.user.nom} ${req.user.prenom}.`
      });
    }

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

    await conge.update(req.body);
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
        date_debut: { [Op.lte]: aujourdHui },
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
      utilisateur_id: conge.utilisateurId,
      type: "mise_a_jour_conge",
      message: `Votre demande de congé du ${conge.date_debut} au ${conge.date_fin} a été ${statut}.`
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
      utilisateur_id: conge.utilisateurId,
      type: "suppression_conge",
      message: `Votre congé du ${conge.date_debut} au ${conge.date_fin} a été supprimé.`
    });

    res.json({ message: "Congé supprimé" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
