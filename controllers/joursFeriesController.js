const { JoursFeries } = require('../models');

// Créer un jour férié
exports.createJourFerie = async (req, res) => {
  try {
    const { date, label, deduire_temps } = req.body;
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
      label,
      deduire_temps
    });

    res.status(201).json(jourFerie);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Lister les jours fériés
exports.getAllJoursFeries = async (req, res) => {
  try {
    let jours;
    if (req.user.role === "super_admin") {
      jours = await JoursFeries.findAll({ where: { entrepriseId: null } });
    } else if (req.user.role === "admin_entreprise") {
      jours = await JoursFeries.findAll({
        where: {
          entrepriseId: [null, req.user.entrepriseId]
        }
      });
    } else {
      return res.status(403).json({ error: "Accès refusé" });
    }
    res.json(jours);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Obtenir un jour férié par ID
exports.getJourFerieById = async (req, res) => {
  try {
    const { id } = req.params;
    const jour = await JoursFeries.findByPk(id);

    if (!jour) return res.status(404).json({ error: "Jour férié non trouvé" });

    if (req.user.role === "super_admin" && jour.entrepriseId === null) {
      return res.json(jour);
    } else if (req.user.role === "admin_entreprise" && (jour.entrepriseId === null || jour.entrepriseId === req.user.entrepriseId)) {
      return res.json(jour);
    } else {
      return res.status(403).json({ error: "Accès refusé" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Mettre à jour un jour férié
exports.updateJourFerie = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, label, deduire_temps } = req.body;
    const jour = await JoursFeries.findByPk(id);

    if (!jour) return res.status(404).json({ error: "Jour férié non trouvé" });

    if (req.user.role === "super_admin" && jour.entrepriseId === null) {
      await jour.update({ date, label, deduire_temps });
    } else if (req.user.role === "admin_entreprise" && jour.entrepriseId === req.user.entrepriseId) {
      await jour.update({ date, label, deduire_temps });
    } else {
      return res.status(403).json({ error: "Accès refusé" });
    }

    res.json(jour);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Supprimer un jour férié
exports.deleteJourFerie = async (req, res) => {
  try {
    const { id } = req.params;
    const jour = await JoursFeries.findByPk(id);

    if (!jour) return res.status(404).json({ error: "Jour férié non trouvé" });

    if (req.user.role === "super_admin" && jour.entrepriseId === null) {
      await jour.destroy();
    } else if (req.user.role === "admin_entreprise" && jour.entrepriseId === req.user.entrepriseId) {
      await jour.destroy();
    } else {
      return res.status(403).json({ error: "Accès refusé" });
    }

    res.json({ message: "Jour férié supprimé" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
