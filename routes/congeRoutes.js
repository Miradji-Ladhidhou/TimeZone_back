const express = require('express');
const router = express.Router();
const congeController = require('../controllers/congeController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { roleMiddleware } = require('../middlewares/roleMiddleware');
const { alertesConges } = require('../controllers/congeController');

router.use(authMiddleware);

// Création congé (tous employés peuvent créer)
router.post(
  '/',
  roleMiddleware(['super_admin', 'admin_entreprise', 'manager', 'employe']),
  congeController.createConge
);

// Liste des congés
router.get(
  '/',
  roleMiddleware(['super_admin', 'admin_entreprise', 'manager']),
  congeController.getAllConges
);


// Alertes 
router.get(
  '/alertes',
  roleMiddleware(['super_admin', 'admin_entreprise', 'manager']),
  congeController.alertesConges
);

// Congé par id
router.get(
  '/:id',
  roleMiddleware(['super_admin', 'admin_entreprise', 'manager', 'employe']),
  congeController.getCongeById
);

// Employé modifie son congé
router.put(
  '/:id',
  roleMiddleware(['super_admin', 'admin_entreprise', 'manager', 'employe']),
  congeController.updateConge
);

// Solde congés par employé
router.get(
  "/soldes/:id",
  roleMiddleware(['super_admin', 'admin_entreprise', 'manager', 'employe']),
  congeController.getSolde
);


// Manager/admin valide/refuse
router.put(
  '/:id/valider',
  roleMiddleware(['super_admin', 'admin_entreprise', 'manager']),
  congeController.validerConge
);

// Suppression congé
router.delete(
  '/:id',
  roleMiddleware(['super_admin', 'admin_entreprise']),
  congeController.deleteConge
);


module.exports = router;
