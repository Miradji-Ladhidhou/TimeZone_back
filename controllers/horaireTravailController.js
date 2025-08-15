const { HoraireTravail } = require('../models');

const checkEntrepriseAccess = (req, entrepriseId) => {
  if (req.user.role === 'super_admin') return true;
  return req.user.entrepriseId === entrepriseId;
};

// Créer un horaire
exports.createHoraire = async (req, res) => {
  try {
    if (!['super_admin','admin_entreprise'].includes(req.user.role)) return res.status(403).json({ error: 'Accès refusé' });
    if (req.user.role !== 'super_admin') req.body.entrepriseId = req.user.entrepriseId;

    const horaire = await HoraireTravail.create(req.body);
    res.status(201).json(horaire);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Lire tous les horaires
exports.getAllHoraires = async (req, res) => {
  try {
    const where = {};
    if (req.user.role !== 'super_admin') where.entrepriseId = req.user.entrepriseId;
    const horaires = await HoraireTravail.findAll({ where });
    res.json(horaires);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Lire un horaire par ID
exports.getHoraireById = async (req, res) => {
  try {
    const horaire = await HoraireTravail.findByPk(req.params.id);
    if (!horaire) return res.status(404).json({ error: 'Horaire non trouvé' });
    if (!checkEntrepriseAccess(req, horaire.entrepriseId)) return res.status(403).json({ error: 'Accès refusé' });
    res.json(horaire);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Mettre à jour un horaire
exports.updateHoraire = async (req, res) => {
  try {
    const horaire = await HoraireTravail.findByPk(req.params.id);
    if (!horaire) return res.status(404).json({ error: 'Horaire non trouvé' });
    if (!checkEntrepriseAccess(req, horaire.entrepriseId)) return res.status(403).json({ error: 'Accès refusé' });

    await horaire.update(req.body);
    res.json(horaire);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Supprimer un horaire
exports.deleteHoraire = async (req, res) => {
  try {
    const horaire = await HoraireTravail.findByPk(req.params.id);
    if (!horaire) return res.status(404).json({ error: 'Horaire non trouvé' });
    if (!checkEntrepriseAccess(req, horaire.entrepriseId)) return res.status(403).json({ error: 'Accès refusé' });

    await horaire.destroy();
    res.json({ message: 'Horaire supprimé' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
