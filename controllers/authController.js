const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Utilisateur, Entreprise } = require('../models');

// LOGIN
exports.login = async (req, res) => {
  try {
    const { email, mot_de_passe } = req.body;
    const user = await Utilisateur.scope('withPassword').findOne({ where: { email } });
    if (!user || !user.actif) return res.status(401).json({ error: 'Email ou mot de passe invalide' });

    const match = await bcrypt.compare(mot_de_passe, user.mot_de_passe);
    if (!match) return res.status(401).json({ error: 'Email ou mot de passe invalide' });

    const token = jwt.sign(
      { id: user.id, entrepriseId: user.entrepriseId, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// SELF: changer son mot de passe
exports.changeMyPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await Utilisateur.scope('withPassword').findByPk(req.user.id);
    if (!user) return res.status(404).json({ error: 'Utilisateur introuvable' });

    const ok = await bcrypt.compare(currentPassword, user.mot_de_passe);
    if (!ok) return res.status(400).json({ error: 'Mot de passe actuel invalide' });

    const hash = await bcrypt.hash(newPassword, 10);
    await user.update({ mot_de_passe: hash });
    res.json({ message: 'Mot de passe mis à jour' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// ADMIN/SUPER_ADMIN: réinitialiser le mot de passe d’un user
exports.resetPassword = async (req, res) => {
  try {
    const { userId, newPassword } = req.body;
    const target = await Utilisateur.scope('withPassword').findByPk(userId);
    if (!target) return res.status(404).json({ error: 'Utilisateur introuvable' });

    // droits: super_admin tout; admin_entreprise uniquement sa société
    if (req.user.role === 'admin_entreprise' && target.entrepriseId !== req.user.entrepriseId) {
      return res.status(403).json({ error: 'Accès refusé' });
    }

    const hash = await bcrypt.hash(newPassword, 10);
    await target.update({ mot_de_passe: hash });
    res.json({ message: 'Mot de passe réinitialisé' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
