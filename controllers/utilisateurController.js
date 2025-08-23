const { Utilisateur } = require('../models');
const { Entreprise } = require('../models');
const bcrypt = require('bcrypt');
const generatePassword = require('../utils/generatePassword');
const { sendEmail } = require('../utils/emailService');

const checkEntrepriseAccess = (req, entrepriseId) => {
  if (req.user.role === 'super_admin') return true;
  return req.user.entrepriseId === entrepriseId;
};

// Créer un utilisateur
// super_admin → peut créer n’importe qui (y compris admin_entreprise) et choisir entrepriseId
// admin_entreprise → peut créer manager/employe UNIQUEMENT dans sa propre entreprise (entrepriseId forcé)
exports.createUtilisateur = async (req, res) => {
  try {
    if (!['super_admin', 'admin_entreprise'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Accès refusé' });
    }

    const { nom, prenom, email } = req.body;

    // rôle imposé par le serveur (pas depuis le front)
    let role = 'employe';
    let entrepriseId = req.body.entrepriseId;

    if (req.user.role === 'super_admin') {
      // super_admin peut créer admin_entreprise/manager/employe
      const requestedRole = req.body.role;
      if (['admin_entreprise', 'manager', 'employe'].includes(requestedRole)) {
        role = requestedRole;
      }
      if (!entrepriseId) return res.status(400).json({ error: 'entrepriseId requis' });
    } else {
      // admin_entreprise → limité à manager/employe et entreprise courante
      if (req.body.role === 'manager') role = 'manager';
      entrepriseId = req.user.entrepriseId;
    }

    // Vérification de l'existence de l'entreprise
    const entreprise = await Entreprise.findByPk(entrepriseId);
    if (!entreprise) {
      return res.status(400).json({ error: 'Entreprise non trouvée' });
    }

    const plainPassword = generatePassword(12);
    const hash = await bcrypt.hash(plainPassword, 10);
    const utilisateur = await Utilisateur.create({
      nom, prenom, email,
      mot_de_passe: hash,
      role,
      entrepriseId,
      actif: true,
    });

    // Envoi du mot de passe temporaire par email
    const subject = 'Bienvenue sur TimeZone App';
    const html = `<p>Bonjour ${utilisateur.prenom} ${utilisateur.nom},</p>
      <p>Votre compte a été créé avec succès.</p>
      <p>Pour l'entreprise : ${entreprise.nom}</p>
      <p>Voici vos informations de connexion :</p>
      <p>Email : ${email}</p>
      <p>Mot de passe temporaire : <strong>${plainPassword}</strong></p>
      <p>Veuillez vous connecter et changer votre mot de passe dès que possible.</p>
      <p>Cordialement,<br>L’équipe TimeZone App</p>`;

    try {
      await sendEmail({
        to: email,
        subject,
        text: `Bonjour ${utilisateur.prenom} ${utilisateur.nom}, votre mot de passe temporaire est : ${plainPassword}`,
        html
      });
    } catch (err) {
      console.error('Erreur lors de l\'envoi de l\'email:', err);
      return res.status(500).json({ error: 'Erreur lors de l\'envoi de l\'email' });
    }

    res.status(201).json({
      message: 'Utilisateur créé avec succès. Un mot de passe temporaire a été généré et envoyé par email.',
      utilisateur: {
        id: utilisateur.id,
        nom: utilisateur.nom,
        prenom: utilisateur.prenom,
        email: utilisateur.email,
        role: utilisateur.role,
        entrepriseId: utilisateur.entrepriseId,
      },
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Lire tous les utilisateurs (visibilité)
exports.getAllUtilisateurs = async (req, res) => {
  try {
    let where = {};
    if (req.user.role === 'super_admin') {
      // voit tout
    } else if (['admin_entreprise', 'manager'].includes(req.user.role)) {
      where.entrepriseId = req.user.entrepriseId;
    } else if (req.user.role === 'employe') {
      where.id = req.user.id;
    }
    const utilisateurs = await Utilisateur.findAll({ where });
    res.json(utilisateurs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Lire un utilisateur
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

    // droits
    const self = req.user.id === utilisateur.id;
    const sameCompany = req.user.entrepriseId === utilisateur.entrepriseId;
    const canAdmin = req.user.role === 'super_admin' || (req.user.role === 'admin_entreprise' && sameCompany);

    if (!(self || canAdmin)) return res.status(403).json({ error: 'Accès refusé' });

    // on empêche la mise à jour du rôle par quiconque sauf super_admin (et admin_entreprise ne peut pas promouvoir admin)
    if ('role' in req.body) {
      if (req.user.role === 'super_admin') {
        const allowed = ['admin_entreprise', 'manager', 'employe'];
        if (!allowed.includes(req.body.role)) return res.status(400).json({ error: 'Rôle non autorisé' });
      } else {
        delete req.body.role;
      }
    }

    // mot de passe si fourni (réhash)
    if (req.body.mot_de_passe) {
      req.body.mot_de_passe = await bcrypt.hash(req.body.mot_de_passe, 10);
    }

    // empêcher le changement d’entrepriseId sauf super_admin
    if ('entrepriseId' in req.body && req.user.role !== 'super_admin') {
      delete req.body.entrepriseId;
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

    const sameCompany = req.user.entrepriseId === utilisateur.entrepriseId;
    const canDelete =
      req.user.role === 'super_admin' ||
      (req.user.role === 'admin_entreprise' && sameCompany);

    if (!canDelete) return res.status(403).json({ error: 'Accès refusé' });

    await utilisateur.destroy();
    res.json({ message: 'Utilisateur supprimé avec succès' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
