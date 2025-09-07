const express = require("express");
const router = express.Router();
const soldeCongeController = require("../controllers/soldeCongeController");
const { authMiddleware } = require("../middlewares/authMiddleware");
const { roleMiddleware } = require("../middlewares/roleMiddleware");

router.use(authMiddleware);

// GET /solde/me → utilisateur connecté
router.get("/me", soldeCongeController.getSoldeConge);

// PUT /solde → admin_entreprise ou super_admin met à jour un type précis
router.put(
  "/",
  roleMiddleware(["admin_entreprise", "super_admin"]),
  soldeCongeController.updateSoldeConge
);

// DELETE /solde/:utilisateurId/:typeConge → supprime un type précis
router.delete(
  "/:utilisateurId/:typeConge",
  roleMiddleware(["admin_entreprise", "super_admin"]),
  soldeCongeController.deleteSoldeConge
);

module.exports = router;
