const { Conge } = require('../models');

const checkEntrepriseAccess = (req, entrepriseId) => {
  if (req.user.role === 'super_admin') return true;
  return req.user.entrepriseId === entrepriseId;
};

exports.createConge = async (req, res) => {
  try {
    if (!['super_admin','admin_entreprise','manager','employe'].includes(req.user.role)) return res.status(403).json({ error: 'Accès refusé' });
    if (req.user.role !== 'super_admin') req.body.entrepriseId = req.user.entrepriseId;
    if (req.user.role === 'employe') req.body.utilisateurId = req.user.id;

    const conge = await Conge.create(req.body);
    res.status(201).json(conge);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getAllConges = async (req, res) => {
  try {
    const where = {};
    if (!['super_admin'].includes(req.user.role)) where.entrepriseId = req.user.entrepriseId;
    if (req.user.role === 'employe') where.utilisateurId = req.user.id;

    const conges = await Conge.findAll({ where });
    res.json(conges);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getCongeById = async (req, res) => {
  try {
    const conge = await Conge.findByPk(req.params.id);
    if (!conge) return res.status(404).json({ error: 'Congé non trouvé' });
    if (!checkEntrepriseAccess(req, conge.entrepriseId) && req.user.id !== conge.utilisateurId) return res.status(403).json({ error: 'Accès refusé' });
    res.json(conge);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateConge = async (req, res) => {
  try {
    const conge = await Conge.findByPk(req.params.id);
    if (!conge) return res.status(404).json({ error: 'Congé non trouvé' });
    if (!checkEntrepriseAccess(req, conge.entrepriseId) && req.user.id !== conge.utilisateurId) return res.status(403).json({ error: 'Accès refusé' });

    await conge.update(req.body);
    res.json(conge);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteConge = async (req, res) => {
  try {
    const conge = await Conge.findByPk(req.params.id);
    if (!conge) return res.status(404).json({ error: 'Congé non trouvé' });
    if (!['super_admin','admin_entreprise'].includes(req.user.role) && req.user.id !== conge.utilisateurId) return res.status(403).json({ error: 'Accès refusé' });

    await conge.destroy();
    res.json({ message: 'Congé supprimé' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
