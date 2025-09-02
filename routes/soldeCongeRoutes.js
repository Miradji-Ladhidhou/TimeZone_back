const express = require("express");
const router = express.Router();
const soldeCongeController = require("../controllers/soldeCongeController");
const { authMiddleware } = require("../middlewares/authMiddleware");

// ========================
// Routes pour la gestion des soldes de congés
// ========================

// Récupérer le solde du user connecté
router.get("/me", authMiddleware, soldeCongeController.getSoldeConge);

// Mettre à jour le solde (admin entreprise uniquement)
router.put("/", authMiddleware, soldeCongeController.updateSoldeConge);

// Supprimer un solde (admin entreprise uniquement)
router.delete("/:utilisateurId", authMiddleware, soldeCongeController.deleteSoldeConge);

module.exports = router;
