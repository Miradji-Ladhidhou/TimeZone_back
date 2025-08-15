const { RegleHeuresSupp } = require('../models');

const checkEntrepriseAccess = (req, entrepriseId) => {
  if (req.user.role === 'super_admin') return true;
  return req.user.entrepriseId === entrepriseId;
};

exports.createRegle = async (req, res) => {
  try {
    if (!['super_admin','admin_entreprise'].includes(req.user.role)) return res.status(403).json({ error: 'Accès refusé' });
    if (req.user.role !== 'super_admin') req.body.entrepriseId = req.user.entrepriseId;

    const regle = await RegleHeuresSupp.create(req.body);
    res.status(201).json(regle);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getAllRegles = async (req, res) => {
  try {
    const where = {};
    if (req.user.role !== 'super_admin') where.entrepriseId = req.user.entrepriseId;

    const regles = await RegleHeuresSupp.findAll({ where });
    res.json(regles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getRegleById = async (req, res) => {
  try {
    const regle = await RegleHeuresSupp.findByPk(req.params.id);
    if (!regle) return res.status(404).json({ error: 'Règle non trouvée' });
    if (!checkEntrepriseAccess(req, regle.entrepriseId)) return res.status(403).json({ error: 'Accès refusé' });
    res.json(regle);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateRegle = async (req, res) => {
  try {
    const regle = await RegleHeuresSupp.findByPk(req.params.id);
    if (!regle) return res.status(404).json({ error: 'Règle non trouvée' });
    if (!checkEntrepriseAccess(req, regle.entrepriseId)) return res.status(403).json({ error: 'Accès refusé' });

    await regle.update(req.body);
    res.json(regle);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteRegle = async (req, res) => {
  try {
    const regle = await RegleHeuresSupp.findByPk(req.params.id);
    if (!regle) return res.status(404).json({ error: 'Règle non trouvée' });
    if (!checkEntrepriseAccess(req, regle.entrepriseId)) return res.status(403).json({ error: 'Accès refusé' });

    await regle.destroy();
    res.json({ message: 'Règle supprimée' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
