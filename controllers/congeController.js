const { Conge } = require('../models');
const { getCongesAlertes } = require('../utils/congesAlertes');
const { DateBloquee } = require('../models');
const { Utilisateur } = require('../models');
const { sendEmail } = require('../utils/emailService');
const { Op } = require('sequelize');

// Helper pour formater les dates
const formatDate = (date) => new Date(date).toLocaleDateString('fr-FR');

// Helper pour détecter chevauchements
const getChevauchements = async (conge) => {
  const chevauchements = [];

  // Autres congés
  const autresConges = await Conge.findAll({
    where: {
      entrepriseId: conge.entrepriseId,
      statut: { [Op.in]: ['en_attente', 'approuve'] },
      id: { [Op.ne]: conge.id },
      [Op.or]: [
        { date_debut: { [Op.between]: [conge.date_debut, conge.date_fin] } },
        { date_fin: { [Op.between]: [conge.date_debut, conge.date_fin] } },
        { date_debut: { [Op.lte]: conge.date_debut }, date_fin: { [Op.gte]: conge.date_fin } }
      ]
    }
  });
  chevauchements.push(...autresConges.map(c => `${formatDate(c.date_debut)} → ${formatDate(c.date_fin)} (autre congé)`));

  // Dates bloquées
  const datesBloquees = await DateBloquee.findAll({
    where: {
      entrepriseId: conge.entrepriseId,
      [Op.or]: [
        { date_debut: { [Op.between]: [conge.date_debut, conge.date_fin] } },
        { date_fin: { [Op.between]: [conge.date_debut, conge.date_fin] } },
        { date_debut: { [Op.lte]: conge.date_debut }, date_fin: { [Op.gte]: conge.date_fin } }
      ]
    }
  });
  chevauchements.push(...datesBloquees.map(d => `${formatDate(d.date_debut)} → ${formatDate(d.date_fin)} (date bloquée)`));

  return chevauchements;
};

const checkEntrepriseAccess = (req, entrepriseId) => req.user.role === 'super_admin' || req.user.entrepriseId === entrepriseId;


exports.createConge = async (req, res) => {
  try {
    if (!['super_admin', 'admin_entreprise', 'manager', 'employe'].includes(req.user.role))
      return res.status(403).json({ error: 'Accès refusé' });

    if (req.user.role !== 'super_admin') req.body.entrepriseId = req.user.entrepriseId;
    if (req.user.role === 'employe') req.body.utilisateurId = req.user.id;

    const conge = await Conge.create(req.body);
    const user = await Utilisateur.findByPk(conge.utilisateurId);

    // Email confirmation employé
    if (user?.email) {
      await sendEmail({
        to: user.email,
        subject: "Confirmation de votre demande de congé",
        html: `<p>Bonjour ${user.prenom},</p>
               <p>Votre demande de congé du <b>${formatDate(conge.date_debut)}</b> au <b>${formatDate(conge.date_fin)}</b> a bien été enregistrée.</p>
               <p>Statut actuel : ${conge.statut}.</p>
               <p>Vous serez notifié dès qu’un admin aura validé ou refusé votre demande.</p>
               <p>Cordialement,<br>L’équipe RH</p>`
      });
    }

    // Chevauchements
    const chevauchements = await getChevauchements(conge);

    // Notifier tous les admins de l'entreprise
    const admins = await Utilisateur.findAll({ where: { entrepriseId: conge.entrepriseId, role: 'admin_entreprise' } });
    for (const admin of admins) {
      if (!admin.email) continue;

      let html = `<p>Bonjour ${admin.prenom},</p>
                  <p>${user.prenom} ${user.nom} a fait une demande de congé du <b>${formatDate(conge.date_debut)}</b> au <b>${formatDate(conge.date_fin)}</b>.</p>
                  <p>Statut actuel : ${conge.statut}.</p>`;

      if (chevauchements.length) {
        html += `<p> Attention : chevauchements détectés avec les périodes suivantes :</p>
                 <ul>${chevauchements.map(c => `<li>${c}</li>`).join('')}</ul>`;
      }

      html += `<p>Merci de vous connecter à la plateforme pour valider ou refuser la demande.</p>
               <p>Cordialement,<br>L’équipe RH</p>`;

      await sendEmail({ to: admin.email, subject: "Nouvelle demande de congé à valider", html });
    }

    res.status(201).json(conge);
  } catch (err) {
    console.error(err);
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
    if (!conge) return res.status(404).json({ error: "Congé non trouvé" });

    // Vérifier que l’utilisateur modifie son propre congé
    if (req.user.id !== conge.utilisateurId) {
      return res.status(403).json({ error: "Accès refusé" });
    }

    // Seulement modifiable si en attente
    if (conge.statut !== "en_attente") {
      return res.status(400).json({ error: "Impossible de modifier un congé déjà traité" });
    }

    // Champs autorisés
    const allowedFields = ["date_debut", "date_fin", "commentaire"];
    const updates = {};
    for (let key of allowedFields) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    await conge.update(updates);
    res.json(conge);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.validerConge = async (req, res) => {
  try {
    const conge = await Conge.findByPk(req.params.id);
    if (!conge) return res.status(404).json({ error: "Congé non trouvé" });

    // Vérif rôle et entreprise
    if (!["super_admin", "admin_entreprise", "manager"].includes(req.user.role)) {
      return res.status(403).json({ error: "Seul un manager ou admin peut valider un congé" });
    }
    if (!checkEntrepriseAccess(req, conge.entrepriseId)) {
      return res.status(403).json({ error: "Accès refusé" });
    }

    const { statut, commentaire } = req.body;

    // Validation statut
    if (!["approuve", "refuse"].includes(statut)) {
      return res.status(400).json({ error: "Statut invalide" });
    }

    await conge.update({ statut, commentaire });

    // Envoi email
    const user = await Utilisateur.findByPk(conge.utilisateurId);
    if (user) {
      const fullName = [user.prenom, user.nom].filter(Boolean).join(" ");
      const subject = `Votre demande de congé a été ${statut}`;
      let html = `
        <p>Bonjour ${fullName},</p>
        <p>Votre demande de congé du <b>${conge.date_debut}</b> au <b>${conge.date_fin}</b> a été <b>${statut}</b>.</p>
      `;

      if (commentaire) {
        html += `<p><b>Commentaire :</b> ${commentaire}</p>`;
      }

      html += `<p>Cordialement,<br>L’équipe TimeZone App</p>`;

      try {
        await sendEmail({ to: user.email, subject, html, text: subject });
      } catch (err) {
        console.error("Erreur lors de l'envoi de l'email congé:", err);
      }
    }

    res.json(conge);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};



exports.deleteConge = async (req, res) => {
  try {
    const conge = await Conge.findByPk(req.params.id);
    if (!conge) return res.status(404).json({ error: 'Congé non trouvé' });
    if (!['super_admin', 'admin_entreprise'].includes(req.user.role) && req.user.id !== conge.utilisateurId) return res.status(403).json({ error: 'Accès refusé' });

    await conge.destroy();
    res.json({ message: 'Congé supprimé' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.alertesConges = async (req, res) => {
  try {
    // Option : filtrer par utilisateur si req.query.utilisateur_id
    const utilisateurId = req.query.utilisateur_id ? parseInt(req.query.utilisateur_id) : null;

    // Si l'utilisateur n'est pas super_admin, on force l'entreprise
    const alertes = await getCongesAlertes(
      req.user.role !== 'super_admin' ? { entrepriseId: req.user.entrepriseId, utilisateurId } : utilisateurId
    );

    res.json(alertes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
