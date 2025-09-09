const { DateBloquee } = require('../models');

// ========================
// Helper : vérifier accès entreprise
// ========================
const checkEntrepriseAccess = (req, entrepriseId) => {
  if (req.user.role === 'super_admin') return true;
  return req.user.entrepriseId === entrepriseId;
};

// ========================
// Création d'une date bloquée
// ========================
exports.createDateBloquee = async (req, res) => {
  try {
    if (!['super_admin','admin_entreprise'].includes(req.user.role))
      return res.status(403).json({ error: 'Accès refusé' });

    // Forcer entrepriseId si pas super_admin
    if (req.user.role !== 'super_admin') req.body.entrepriseId = req.user.entrepriseId;

    const { dateDebut, dateFin, raison } = req.body;

    const dateBloquee = await DateBloquee.create({
      entrepriseId: req.body.entrepriseId,
      dateDebut,
      dateFin,
      raison
    });

    res.status(201).json(dateBloquee);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// ========================
// Récupérer toutes les dates bloquées
// ========================
exports.getAllDatesBloquees = async (req, res) => {
  try {
    const where = {};
    if (req.user.role !== 'super_admin') where.entrepriseId = req.user.entrepriseId;

    const dates = await DateBloquee.findAll({ where });
    res.json(dates);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ========================
// Récupérer une date bloquée par ID
// ========================
exports.getDateBloqueeById = async (req, res) => {
  try {
    const dateBloquee = await DateBloquee.findByPk(req.params.id);
    if (!dateBloquee) return res.status(404).json({ error: 'Date bloquée non trouvée' });

    if (!checkEntrepriseAccess(req, dateBloquee.entrepriseId))
      return res.status(403).json({ error: 'Accès refusé' });

    res.json(dateBloquee);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ========================
// Mise à jour d'une date bloquée
// ========================
exports.updateDateBloquee = async (req, res) => {
  try {
    const dateBloquee = await DateBloquee.findByPk(req.params.id);
    if (!dateBloquee) return res.status(404).json({ error: 'Date bloquée non trouvée' });

    if (!checkEntrepriseAccess(req, dateBloquee.entrepriseId))
      return res.status(403).json({ error: 'Accès refusé' });

    // Filtrer uniquement les champs modifiables
    const { dateDebut, dateFin, raison } = req.body;
    await dateBloquee.update({ dateDebut, dateFin, raison });

    res.json(dateBloquee);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// ========================
// Suppression d'une date bloquée
// ========================
exports.deleteDateBloquee = async (req, res) => {
  try {
    const dateBloquee = await DateBloquee.findByPk(req.params.id);
    if (!dateBloquee) return res.status(404).json({ error: 'Date bloquée non trouvée' });

    if (!checkEntrepriseAccess(req, dateBloquee.entrepriseId))
      return res.status(403).json({ error: 'Accès refusé' });

    await dateBloquee.destroy();
    res.json({ message: 'Date bloquée supprimée' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
