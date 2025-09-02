// utils/solde.js
const { SoldeConge } = require('../models');
const { Op } = require('sequelize');

/**
 * Met à jour le solde d’un utilisateur.
 * @param {number} utilisateurId - ID de l’utilisateur
 * @param {string} typeConge - Type de congé (ex: "CP", "RTT", "Sans solde")
 * @param {number} jours - Nombre de jours à déduire ou ajouter
 * @param {"ajout"|"annulation"} action - Mode de mise à jour
 */
async function majSolde(utilisateurId, typeConge, jours, action = "ajout") {
  try {
    let solde = await SoldeConge.findOne({
      where: { utilisateurId, typeConge }
    });

    if (!solde) {
      // Si aucun solde trouvé → on initialise
      solde = await SoldeConge.create({
        utilisateurId,
        typeConge,
        acquis: 0,
        utilise: 0,
        restant: 0
      });
    }

    if (action === "ajout") {
      solde.utilise += jours;
      solde.restant -= jours;
    } else if (action === "annulation") {
      solde.utilise -= jours;
      solde.restant += jours;
    }

    // Sécurité → pas de négatif
    if (solde.utilise < 0) solde.utilise = 0;
    if (solde.restant < 0) solde.restant = 0;

    await solde.save();
    return solde;

  } catch (err) {
    console.error("Erreur majSolde:", err);
    throw err;
  }
}

module.exports = { majSolde };
