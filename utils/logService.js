const { LogAction } = require("../models");

async function logAction({ utilisateurId, action, tableCible, elementId, details, dateAction = new Date() }) {
  try {
    await LogAction.create({
      utilisateurId,
      action,
      tableCible,
      elementId,
      details,
      dateAction, 
    });
  } catch (err) {
    console.error("Erreur lors de la création du log :", err);
  }
}

module.exports = { logAction };
