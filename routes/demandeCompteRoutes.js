const express = require("express");
const router = express.Router();
const { sendEmail } = require("../utils/emailService");

router.post("/", async (req, res) => {
  try {
    const { nom, prenom, email, entreprise, numeroSiret, adresseEntreprise, pays, message } = req.body;

    if (!nom || !prenom || !email || !entreprise || !numeroSiret || !adresseEntreprise || !pays) {
      return res.status(400).json({ error: "Tous les champs obligatoires doivent être remplis" });
    }

    // Email au Super Admin
    const subjectAdmin = `Nouvelle demande de création de compte entreprise`;
    const htmlAdmin = `
      <h2>Nouvelle demande reçue</h2>
      <p><strong>Entreprise :</strong> ${entreprise}</p>
      <p><strong>Numéro SIRET :</strong> ${numeroSiret}</p>
      <p><strong>Contact :</strong> ${prenom} ${nom}</p>
      <p><strong>Email :</strong> ${email}</p>
      <p><strong>Adresse de l'entreprise :</strong> ${adresseEntreprise}</p>
      <p><strong>Pays :</strong> ${pays}</p>
      ${message ? `<p><strong>Message :</strong> ${message}</p>` : ""}
    `;
    const textAdmin = `Nouvelle demande : Entreprise=${entreprise} ${adresseEntreprise} ${pays}, Contact=${prenom} ${nom}, Email=${email}, Message=${message || "-"}`;

    await sendEmail({
      to: process.env.SUPERADMIN_EMAIL, // Super Admin email
      subject: subjectAdmin,
      text: textAdmin,
      html: htmlAdmin
    });

    // Email de confirmation au demandeur
    const subjectUser = "Confirmation de votre demande de compte entreprise";
    const htmlUser = `
      <p>Bonjour ${prenom} ${nom},</p>
      <p>Nous avons bien reçu votre demande de création de compte pour l’entreprise <strong>${entreprise}</strong>.</p>
      <p>Notre équipe vous contactera dès que votre compte sera créé et validé.</p>
      <p>Merci pour votre confiance,<br>L’équipe TimeZone SaaS</p>
    `;
    const textUser = `Bonjour ${prenom} ${nom}, nous avons bien reçu votre demande pour l'entreprise ${entreprise}. Notre équipe vous contactera prochainement.`;

    await sendEmail({
      to: email,
      subject: subjectUser,
      text: textUser,
      html: htmlUser
    });

    res.status(200).json({ message: "Demande envoyée avec succès ! Un email de confirmation vous a été envoyé." });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Impossible d'envoyer la demande" });
  }
});

module.exports = router;
