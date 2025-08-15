const { Utilisateur } = require('../models');
const bcrypt = require('bcrypt');

// Vérifie accès multi-entreprise
const checkEntrepriseAccess = (req, entrepriseId) => {
  if (req.user.role === 'super_admin') return true;
  return req.user.entrepriseId === entrepriseId;
};

// Créer un utilisateur
exports.createUtilisateur = async (req, res) => {
  try {
    if (!['super_admin', 'admin_entreprise'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Accès refusé' });
    }

    if (req.user.role !== 'super_admin') req.body.entrepriseId = req.user.entrepriseId;

    req.body.mot_de_passe = await bcrypt.hash(req.body.mot_de_passe, 10);
    const utilisateur = await Utilisateur.create(req.body);
    res.status(201).json(utilisateur);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Lire tous les utilisateurs
exports.getAllUtilisateurs = async (req, res) => {
  try {
    let where = {};
    if (['admin_entreprise', 'manager'].includes(req.user.role)) where.entrepriseId = req.user.entrepriseId;
    else if (req.user.role === 'employe') where.id = req.user.id;

    const utilisateurs = await Utilisateur.findAll({ where });
    res.json(utilisateurs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Lire utilisateur par ID
exports.getUtilisateurById = async (req, res) => {
  try {
    const utilisateur = await Utilisateur.findByPk(req.params.id);
    if (!utilisateur) return res.status(404).json({ error: 'Utilisateur non trouvé' });

    if (!checkEntrepriseAccess(req, utilisateur.entrepriseId) && req.user.id !== utilisateur.id) {
      return res.status(403).json({ error: 'Accès refusé' });
    }
    res.json(utilisateur);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Mettre à jour utilisateur
exports.updateUtilisateur = async (req, res) => {
  try {
    const utilisateur = await Utilisateur.findByPk(req.params.id);
    if (!utilisateur) return res.status(404).json({ error: 'Utilisateur non trouvé' });

    if (!checkEntrepriseAccess(req, utilisateur.entrepriseId) && req.user.id !== utilisateur.id) {
      return res.status(403).json({ error: 'Accès refusé' });
    }

    if (req.body.mot_de_passe) {
      req.body.mot_de_passe = await bcrypt.hash(req.body.mot_de_passe, 10);
    }

    await utilisateur.update(req.body);
    res.json(utilisateur);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Supprimer utilisateur
exports.deleteUtilisateur = async (req, res) => {
  try {
    const utilisateur = await Utilisateur.findByPk(req.params.id);
    if (!utilisateur) return res.status(404).json({ error: 'Utilisateur non trouvé' });

    if (!['super_admin'].includes(req.user.role) &&
        !(req.user.role === 'admin_entreprise' && req.user.entrepriseId === utilisateur.entrepriseId)) {
      return res.status(403).json({ error: 'Accès refusé' });
    }

    await utilisateur.destroy();
    res.json({ message: 'Utilisateur supprimé avec succès' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
