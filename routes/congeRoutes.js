const express = require('express');
const router = express.Router();
const congeController = require('../controllers/congeController');
const { exportCongePDF} = require('../controllers/congeController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { roleMiddleware } = require('../middlewares/roleMiddleware');

router.use(authMiddleware);

// Création congé (tous employés)
router.post(
  '/',
  roleMiddleware(['super_admin', 'admin_entreprise', 'manager', 'employe']),
  congeController.createConge
);

// Liste des congés (avec filtrage dans controller)
router.get(
  '/',
  roleMiddleware(['super_admin', 'admin_entreprise', 'manager', 'employe']),
  congeController.getAllConges
);

// Liste des congés de l’employé connecté
router.get(
  '/mes-conges',
  roleMiddleware(['employe', 'manager']),
  congeController.getMesConges
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

// Mise à jour d’un congé
router.put(
  '/:id',
  roleMiddleware(['super_admin', 'admin_entreprise', 'manager', 'employe']),
  congeController.updateConge
);

// Solde congés par utilisateur
router.get(
  "/soldes/:userId",
  roleMiddleware(['super_admin', 'admin_entreprise', 'manager', 'employe']),
  congeController.getSolde
);

// Validation/refus par manager/admin
router.put(
  '/:id',
  roleMiddleware(['super_admin', 'admin_entreprise', 'manager', 'employe']),
  async (req, res, next) => {
    // Champs autorisés
    const safeFields = ['date_debut', 'date_fin', 'type_conge', 'commentaire'];
    if (['super_admin', 'admin_entreprise', 'manager'].includes(req.user.role)) {
      safeFields.push('etat'); // validation de congé uniquement par manager/admin
    }

    req.body = Object.keys(req.body)
      .filter(key => safeFields.includes(key))
      .reduce((obj, key) => { obj[key] = req.body[key]; return obj; }, {});

    next();
  },
  congeController.updateConge
);


// Suppression congé (employé ou admin)
router.delete(
  '/:id',
  roleMiddleware(['super_admin', 'admin_entreprise', 'manager']),
  congeController.deleteConge
);

// Génération PDF
router.get("/export-pdf", authMiddleware, exportCongePDF);

module.exports = router;
