const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middlewares/authMiddleware');
const { roleMiddleware } = require('../middlewares/roleMiddleware');
const joursFeriesController = require('../controllers/joursFeriesController');

router.use(authMiddleware);

// Création jour férié
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

// Jour férié par ID
router.get(
  '/:id',
  roleMiddleware(['super_admin', 'admin_entreprise', 'manager', 'employe']),
  joursFeriesController.getJourFerieById
);

// Mise à jour jour férié
router.put(
  '/:id',
  roleMiddleware(['super_admin', 'admin_entreprise']),
  async (req, res, next) => {
    const safeFields = ['date', 'description', 'deduire_temps'];
    if (req.user.role === 'super_admin') safeFields.push('entrepriseId');

    req.body = Object.keys(req.body)
      .filter(key => safeFields.includes(key))
      .reduce((obj, key) => { obj[key] = req.body[key]; return obj; }, {});

    next();
  },
  joursFeriesController.updateJourFerie
);


// Suppression jour férié
router.delete(
  '/:id',
  roleMiddleware(['super_admin', 'admin_entreprise']),
  joursFeriesController.deleteJourFerie
);

module.exports = router;
