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
    const allowedRoles = ['super_admin', 'admin_entreprise'];
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Accès refusé' });
    }

    const { nom, prenom, email, role: requestedRole } = req.body;

    if (!email) return res.status(400).json({ error: 'Email requis' });
    if (!nom) return res.status(400).json({ error: 'Nom requis' });

    const existing = await Utilisateur.findOne({ where: { email } });
    if (existing) return res.status(400).json({ error: 'Email déjà utilisé' });

    // Déterminer le rôle et l'entreprise
    let role = 'employe';
    let entrepriseId;

    if (req.user.role === 'super_admin') {
      // Super admin peut créer n'importe quel rôle et choisir l'entreprise
      if (['admin_entreprise', 'manager', 'employe'].includes(requestedRole)) {
        role = requestedRole;
      }
      entrepriseId = req.body.entrepriseId;
      if (!entrepriseId) return res.status(400).json({ error: 'entrepriseId requis' });
    } else {
      // Admin entreprise → limité à manager/employe et même entreprise que lui
      role = requestedRole === 'manager' ? 'manager' : 'employe';
      entrepriseId = req.user.entrepriseId;
    }

    const entreprise = await Entreprise.findByPk(entrepriseId);
    if (!entreprise) return res.status(400).json({ error: 'Entreprise non trouvée' });

    // Générer mot de passe temporaire
    const plainPassword = generatePassword(12);
    const hash = await bcrypt.hash(plainPassword, 10);

    const utilisateur = await Utilisateur.create({
      nom,
      prenom,
      email,
      motDePasse: hash,
      role,
      entrepriseId,
      actif: true,
    });

    // Envoi du mot de passe temporaire par email
    const subject = 'Bienvenue sur TimeZone App';
    const html = `<p>Bonjour ${utilisateur.prenom} ${utilisateur.nom},</p>
                  <p>Votre compte a été créé avec succès pour l'entreprise : ${entreprise.nom}</p>
                  <p>Email : ${email}</p>
                  <p>Mot de passe temporaire : <strong>${plainPassword}</strong></p>
                  <p>Veuillez vous connecter et changer votre mot de passe dès que possible.</p>`;

    try {
      await sendEmail({ to: email, subject, text: `Mot de passe temporaire : ${plainPassword}`, html });
    } catch (err) {
      console.error('Erreur envoi email :', err);
      return res.status(500).json({ error: 'Erreur lors de l\'envoi de l\'email' });
    }

    res.status(201).json({
      message: 'Utilisateur créé avec succès. Un mot de passe temporaire a été envoyé par email.',
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
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Lire tous les utilisateurs
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

    const includeEntreprise = {
      model: Entreprise,
      as: 'entreprise',
      attributes: req.user.role === 'super_admin' ? ['id', 'nom'] : ['nom']
    };

    const utilisateurs = await Utilisateur.findAll({
      where,
      include: [includeEntreprise]
    });

    res.json(utilisateurs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Lire un utilisateur
exports.getUtilisateurById = async (req, res) => {
  try {
    const includeEntreprise = {
      model: Entreprise,
      as: 'entreprise',
      attributes: req.user.role === 'super_admin' ? ['id', 'nom'] : ['nom']
    };

    const utilisateur = await Utilisateur.findByPk(req.params.id, {
      include: [includeEntreprise]
    });

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

    const self = req.user.id === utilisateur.id;
    const sameCompany = req.user.entrepriseId === utilisateur.entrepriseId;
    const isSuperAdmin = req.user.role === 'super_admin';
    const isAdminEntreprise = req.user.role === 'admin_entreprise';

    // Protection : seul un super_admin peut modifier un autre admin_entreprise
    if (utilisateur.role === 'admin_entreprise' && !isSuperAdmin && !self) {
      return res.status(403).json({ error: 'Seul un super admin peut modifier un admin_entreprise' });
    }

    const canAdmin =
      isSuperAdmin ||
      (isAdminEntreprise && sameCompany);

    if (!(self || canAdmin)) {
      return res.status(403).json({ error: 'Accès refusé' });
    }

    // Règles sur les rôles
    if ('role' in req.body) {
      if (isSuperAdmin) {
        const allowed = ['admin_entreprise', 'manager', 'employe'];
        if (!allowed.includes(req.body.role)) {
          return res.status(400).json({ error: 'Rôle non autorisé' });
        }
      } else {
        // Un admin_entreprise ou autre ne peut pas changer de rôle
        delete req.body.role;
      }
    }

    // Réhash du mot de passe si fourni
    if (req.body.motDePasse) {
      req.body.motDePasse = await bcrypt.hash(req.body.motDePasse, 10);
    }

    // Bloquer changement d’entreprise sauf super_admin
    if ('entrepriseId' in req.body && !isSuperAdmin) {
      delete req.body.entrepriseId;
    }

    await utilisateur.update(req.body);
    res.json(utilisateur);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};


// Supprimer utilisateur
exports.deleteUtilisateur = async (req, res) => {
  try {
    const utilisateur = await Utilisateur.findByPk(req.params.id);
    if (!utilisateur) return res.status(404).json({ error: 'Utilisateur non trouvé' });

    const sameCompany = req.user.entrepriseId === utilisateur.entrepriseId;
    const isSuperAdmin = req.user.role === 'super_admin';
    const isAdminEntreprise = req.user.role === 'admin_entreprise';

    // Protection : seul un super_admin peut supprimer un autre admin_entreprise
    if (utilisateur.role === 'admin_entreprise' && !isSuperAdmin) {
      return res.status(403).json({ error: 'Seul un super admin peut supprimer un admin_entreprise' });
    }

    const canDelete =
      isSuperAdmin ||
      (isAdminEntreprise && sameCompany && utilisateur.role !== 'admin_entreprise');

    if (!canDelete) {
      return res.status(403).json({ error: 'Accès refusé' });
    }

    await utilisateur.destroy();
    res.json({ message: 'Utilisateur supprimé avec succès' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

