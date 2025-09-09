const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Utilisateur, Entreprise } = require('../models');
const { sendEmail } = require('../utils/emailService');

// LOGIN
exports.login = async (req, res) => {
  try {
    const { email, motDePasse } = req.body;
    const utilisateur = await Utilisateur.scope('withPassword').findOne({ where: { email } });
    if (!utilisateur || !utilisateur.actif) return res.status(401).json({ error: 'Email ou mot de passe invalide' });

    const match = await bcrypt.compare(motDePasse, utilisateur.motDePasse);
    if (!match) return res.status(401).json({ error: 'Email ou mot de passe invalide' });

    const token = jwt.sign(
      { id: utilisateur.id, entrepriseId: utilisateur.entrepriseId, role: utilisateur.role },
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

    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({ error: 'Le nouveau mot de passe doit contenir au moins 8 caractères' });
    }

    const utilisateur = await Utilisateur.scope('withPassword').findByPk(req.user.id);
    if (!utilisateur) return res.status(404).json({ error: 'Utilisateur introuvable' });

    const ok = await bcrypt.compare(currentPassword, utilisateur.motDePasse);
    if (!ok) return res.status(400).json({ error: 'Mot de passe actuel invalide' });

    const hash = await bcrypt.hash(newPassword, 10);
    await utilisateur.update({ motDePasse: hash });

    // Envoi d'email après modification
    const subject = 'Confirmation de changement de mot de passe';
    const html = `<p>Bonjour ${utilisateur.prenom} ${utilisateur.nom},</p>
                  <p>Votre mot de passe a été modifié avec succès.</p>
                  <p>Si vous n'êtes pas à l'origine de ce changement, veuillez contacter immédiatement l'équipe TimeZone App.</p>
                  <p>Cordialement,<br>L’équipe TimeZone App</p>`;

    try {
      await sendEmail({
        to: utilisateur.email,
        subject,
        text: `Bonjour ${utilisateur.prenom} ${utilisateur.nom}, votre mot de passe a été modifié avec succès.`,
        html
      });
    } catch (err) {
      console.error('Erreur lors de l\'envoi de l\'email de confirmation:', err);
    }

    res.json({ message: 'Mot de passe mis à jour avec succès' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur lors du changement de mot de passe' });
  }
};

// ADMIN/SUPER_ADMIN: réinitialiser le mot de passe d’un utilisateur
exports.resetPassword = async (req, res) => {
  try {
    const { userId, newPassword } = req.body;
    const utilisateur = await Utilisateur.scope('withPassword').findByPk(userId);
    if (!utilisateur) return res.status(404).json({ error: 'Utilisateur introuvable' });

    // droits: super_admin tout; admin_entreprise uniquement sa société
    if (req.user.role === 'admin_entreprise' && utilisateur.entrepriseId !== req.user.entrepriseId) {
      return res.status(403).json({ error: 'Accès refusé' });
    }

    const hash = await bcrypt.hash(newPassword, 10);
    await utilisateur.update({ motDePasse: hash });
    res.json({ message: 'Mot de passe réinitialisé' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
