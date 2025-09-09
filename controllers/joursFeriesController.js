const { JoursFeries } = require('../models');

// ========================
// Création d’un jour férié
// ========================
exports.createJourFerie = async (req, res) => {
  try {
    const { date, description, deduireTemps } = req.body;
    let entrepriseId = null;

    if (req.user.role === "super_admin") {
      entrepriseId = null; // férié global
    } else if (req.user.role === "admin_entreprise") {
      entrepriseId = req.user.entrepriseId; // férié entreprise
    } else {
      return res.status(403).json({ error: "Accès refusé" });
    }

    const jourFerie = await JoursFeries.create({
      entrepriseId,
      date,
      description,
      deduireTemps
    });

    res.status(201).json(jourFerie);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ========================
// Liste des jours fériés
// ========================
exports.getAllJoursFeries = async (req, res) => {
  try {
    let jours;
    if (req.user.role === "super_admin") {
      jours = await JoursFeries.findAll({ where: { entrepriseId: null } });
    } else if (req.user.role === "admin_entreprise") {
      jours = await JoursFeries.findAll({
        where: { entrepriseId: [null, req.user.entrepriseId] }
      });
    } else {
      return res.status(403).json({ error: "Accès refusé" });
    }

    res.json(jours);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ========================
// Obtenir un jour férié par ID
// ========================
exports.getJourFerieById = async (req, res) => {
  try {
    const jour = await JoursFeries.findByPk(req.params.id);
    if (!jour) return res.status(404).json({ error: "Jour férié non trouvé" });

    if (
      (req.user.role === "super_admin" && jour.entrepriseId === null) ||
      (req.user.role === "admin_entreprise" && (jour.entrepriseId === null || jour.entrepriseId === req.user.entrepriseId))
    ) {
      return res.json(jour);
    }

    return res.status(403).json({ error: "Accès refusé" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ========================
// Mise à jour d’un jour férié
// ========================
exports.updateJourFerie = async (req, res) => {
  try {
    const jour = await JoursFeries.findByPk(req.params.id);
    if (!jour) return res.status(404).json({ error: "Jour férié non trouvé" });

    if (
      (req.user.role === "super_admin" && jour.entrepriseId === null) ||
      (req.user.role === "admin_entreprise" && jour.entrepriseId === req.user.entrepriseId)
    ) {
      // Filtrage strict des champs modifiables
      const { date, description, deduireTemps } = req.body;
      await jour.update({ date, description, deduireTemps });
      return res.json(jour);
    }

    return res.status(403).json({ error: "Accès refusé" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ========================
// Suppression d’un jour férié
// ========================
exports.deleteJourFerie = async (req, res) => {
  try {
    const jour = await JoursFeries.findByPk(req.params.id);
    if (!jour) return res.status(404).json({ error: "Jour férié non trouvé" });

    if (
      (req.user.role === "super_admin" && jour.entrepriseId === null) ||
      (req.user.role === "admin_entreprise" && jour.entrepriseId === req.user.entrepriseId)
    ) {
      await jour.destroy();
      return res.json({ message: "Jour férié supprimé" });
    }

    return res.status(403).json({ error: "Accès refusé" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};