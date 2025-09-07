const { SoldeConge } = require('../models');
const { majSolde } = require('../utils/solde');

// Récupérer le solde du user connecté
exports.getSoldeConge = async (req, res) => {
  try {
    const utilisateurId = req.user.id;
    const solde = await SoldeConge.findAll({ where: { utilisateurId } });

    if (!solde || solde.length === 0) {
      return res.status(404).json({ error: "Solde de congés non trouvé" });
    }

    res.json(solde);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Mettre à jour le solde pour un type précis (admin_entreprise ou super_admin)
exports.updateSoldeConge = async (req, res) => {
  try {
    const { utilisateurId, typeConge, jours, action } = req.body; // action = "ajout" ou "retrait"

    if (!utilisateurId || !typeConge || !jours || !["ajout", "retrait"].includes(action)) {
      return res.status(400).json({ error: "Données invalides" });
    }

    await majSolde(utilisateurId, typeConge, jours, action);

    const solde = await SoldeConge.findOne({ where: { utilisateurId, typeConge } });
    res.json(solde);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Supprimer le solde d’un type précis pour un utilisateur
exports.deleteSoldeConge = async (req, res) => {
  try {
    const { utilisateurId, typeConge } = req.params;
    if (!utilisateurId || !typeConge) {
      return res.status(400).json({ error: "Données manquantes" });
    }

    const solde = await SoldeConge.findOne({ where: { utilisateurId, typeConge } });
    if (!solde) return res.status(404).json({ error: "Solde de congés non trouvé" });

    await solde.destroy();
    res.json({ message: `Solde ${typeConge} supprimé pour l'utilisateur ${utilisateurId}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
