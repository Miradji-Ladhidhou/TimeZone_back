const express = require('express');
const router = express.Router();
const dateBloqueeController = require('../controllers/dateBloqueeController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { roleMiddleware } = require('../middlewares/roleMiddleware');

router.use(authMiddleware);

// Création
router.post(
  '/',
  roleMiddleware(['super_admin','admin_entreprise']),
  dateBloqueeController.createDateBloquee
);

// Liste
router.get(
  '/',
  roleMiddleware(['super_admin','admin_entreprise','manager','employe']),
  dateBloqueeController.getAllDatesBloquees
);

// Par ID
router.get(
  '/:id',
  roleMiddleware(['super_admin','admin_entreprise','manager','employe']),
  dateBloqueeController.getDateBloqueeById
);

// Modification
router.put(
  '/:id',
  roleMiddleware(['super_admin', 'admin_entreprise']),
  async (req, res, next) => {
    // Empêche de modifier entrepriseId sauf super_admin
    const safeFields = ['date_debut', 'date_fin', 'raison'];
    if (req.user.role === 'super_admin') safeFields.push('entrepriseId');

    req.body = Object.keys(req.body)
      .filter(key => safeFields.includes(key))
      .reduce((obj, key) => { obj[key] = req.body[key]; return obj; }, {});

    next();
  },
  dateBloqueeController.updateDateBloquee
);


// Suppression
router.delete(
  '/:id',
  roleMiddleware(['super_admin','admin_entreprise']),
  dateBloqueeController.deleteDateBloquee
);

module.exports = router;
