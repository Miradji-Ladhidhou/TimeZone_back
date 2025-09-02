const express = require('express');
const router = express.Router();
const congeController = require('../controllers/congeController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { roleMiddleware } = require('../middlewares/roleMiddleware');
const joursFeriesController = require('../controllers/joursFeriesController');

router.use(authMiddleware);

// Création jour férié (seulement admin_entreprise et super_admin)
router.post(
  '/',
  roleMiddleware(['super_admin', 'admin_entreprise']),
  joursFeriesController.createJourFerie
);
  
// Liste des jours fériés
router.get(
  '/',
  roleMiddleware(['super_admin', 'admin_entreprise', 'manager', 'employe']),
  joursFeriesController.getAllJoursFeries
);

// Jour férié par id
router.get(
  '/:id',
  roleMiddleware(['super_admin', 'admin_entreprise', 'manager', 'employe']),
  joursFeriesController.getJourFerieById
);

// Modification jour férié (seulement admin_entreprise et super_admin)
router.put(
  '/:id',
  roleMiddleware(['super_admin', 'admin_entreprise']),
  joursFeriesController.updateJourFerie
);

// Suppression jour férié (seulement admin_entreprise et super_admin)
router.delete(
  '/:id',
  roleMiddleware(['super_admin', 'admin_entreprise']),
  joursFeriesController.deleteJourFerie
);

module.exports = router;