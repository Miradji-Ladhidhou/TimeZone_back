const { DateBloquee } = require('../models');

const checkEntrepriseAccess = (req, entrepriseId) => {
  if (req.user.role === 'super_admin') return true;
  return req.user.entrepriseId === entrepriseId;
};

exports.createDateBloquee = async (req, res) => {
  try {
    if (!['super_admin','admin_entreprise'].includes(req.user.role)) return res.status(403).json({ error: 'Accès refusé' });
    if (req.user.role !== 'super_admin') req.body.entrepriseId = req.user.entrepriseId;

    const dateBloquee = await DateBloquee.create(req.body);
    res.status(201).json(dateBloquee);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getAllDatesBloquees = async (req, res) => {
  try {
    const where = {};
    if (!['super_admin'].includes(req.user.role)) where.entrepriseId = req.user.entrepriseId;

    const dates = await DateBloquee.findAll({ where });
    res.json(dates);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getDateBloqueeById = async (req, res) => {
  try {
    const dateBloquee = await DateBloquee.findByPk(req.params.id);
    if (!dateBloquee) return res.status(404).json({ error: 'Date bloquée non trouvée' });
    if (!checkEntrepriseAccess(req, dateBloquee.entrepriseId)) return res.status(403).json({ error: 'Accès refusé' });

    res.json(dateBloquee);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateDateBloquee = async (req, res) => {
  try {
    const dateBloquee = await DateBloquee.findByPk(req.params.id);
    if (!dateBloquee) return res.status(404).json({ error: 'Date bloquée non trouvée' });
    if (!checkEntrepriseAccess(req, dateBloquee.entrepriseId)) return res.status(403).json({ error: 'Accès refusé' });

    await dateBloquee.update(req.body);
    res.json(dateBloquee);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteDateBloquee = async (req, res) => {
  try {
    const dateBloquee = await DateBloquee.findByPk(req.params.id);
    if (!dateBloquee) return res.status(404).json({ error: 'Date bloquée non trouvée' });
    if (!checkEntrepriseAccess(req, dateBloquee.entrepriseId)) return res.status(403).json({ error: 'Accès refusé' });

    await dateBloquee.destroy();
    res.json({ message: 'Date bloquée supprimée' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
