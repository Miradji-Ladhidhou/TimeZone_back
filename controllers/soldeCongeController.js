const { SoldeConge } = require('../models');
const { majSolde } = require('../utils/solde');

// ========================
// Récupérer le solde de congés d'un utilisateur
// ========================
exports.getSoldeConge = async (req, res) => {
  try {
    const utilisateurId = req.user.id;
    const solde = await SoldeConge.findOne({ where: { utilisateurId } });

    if (!solde) {
      return res.status(404).json({ error: "Solde de congés non trouvé" });
    }

    res.json(solde);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ========================
// Mettre à jour le solde de congés d'un utilisateur (admin_entreprise ou super_admin uniquement)
// ========================
exports.updateSoldeConge = async (req, res) => {
  try {
    if (!["admin_entreprise", "super_admin"].includes(req.user.role)) {
      return res.status(403).json({ error: "Accès refusé" });
    }

    const { utilisateurId, typeConge, jours, action } = req.body; 
    // action = "ajout" ou "retrait"

    await majSolde(utilisateurId, typeConge, jours, action);

    const solde = await SoldeConge.findOne({ where: { utilisateurId } });
    res.json(solde);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ========================
// Supprimer le solde de congés d'un utilisateur (admin_entreprise ou super_admin uniquement)
// ========================
exports.deleteSoldeConge = async (req, res) => {
  try {
    if (!["admin_entreprise", "super_admin"].includes(req.user.role)) {
      return res.status(403).json({ error: "Accès refusé" });
    }

    const { utilisateurId } = req.params;
    const solde = await SoldeConge.findOne({ where: { utilisateurId } });

    if (!solde) {
      return res.status(404).json({ error: "Solde de congés non trouvé" });
    }

    await solde.destroy();
    res.json({ message: "Solde de congés supprimé avec succès" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
