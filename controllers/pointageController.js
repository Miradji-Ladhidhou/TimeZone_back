const { Pointage } = require('../models');

const checkEntrepriseAccess = (req, entrepriseId) => {
  if (req.user.role === 'super_admin') return true;
  return req.user.entrepriseId === entrepriseId;
};

exports.createPointage = async (req, res) => {
  try {
    if (!['super_admin','admin_entreprise','manager','employe'].includes(req.user.role)) return res.status(403).json({ error: 'Accès refusé' });
    if (req.user.role !== 'super_admin') req.body.entrepriseId = req.user.entrepriseId;
    if (req.user.role === 'employe') req.body.utilisateurId = req.user.id;

    const pointage = await Pointage.create(req.body);
    res.status(201).json(pointage);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getAllPointages = async (req, res) => {
  try {
    const where = {};
    if (!['super_admin'].includes(req.user.role)) where.entrepriseId = req.user.entrepriseId;
    if (req.user.role === 'employe') where.utilisateurId = req.user.id;

    const pointages = await Pointage.findAll({ where });
    res.json(pointages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getPointageById = async (req, res) => {
  try {
    const pointage = await Pointage.findByPk(req.params.id);
    if (!pointage) return res.status(404).json({ error: 'Pointage non trouvé' });
    if (!checkEntrepriseAccess(req, pointage.entrepriseId) && req.user.id !== pointage.utilisateurId) return res.status(403).json({ error: 'Accès refusé' });

    res.json(pointage);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updatePointage = async (req, res) => {
  try {
    const pointage = await Pointage.findByPk(req.params.id);
    if (!pointage) return res.status(404).json({ error: 'Pointage non trouvé' });
    if (!checkEntrepriseAccess(req, pointage.entrepriseId) && req.user.id !== pointage.utilisateurId) return res.status(403).json({ error: 'Accès refusé' });

    await pointage.update(req.body);
    res.json(pointage);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deletePointage = async (req, res) => {
  try {
    const pointage = await Pointage.findByPk(req.params.id);
    if (!pointage) return res.status(404).json({ error: 'Pointage non trouvé' });
    if (!['super_admin','admin_entreprise'].includes(req.user.role) && req.user.id !== pointage.utilisateurId) return res.status(403).json({ error: 'Accès refusé' });

    await pointage.destroy();
    res.json({ message: 'Pointage supprimé' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
