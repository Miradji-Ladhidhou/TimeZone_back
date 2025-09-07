const express = require('express');
const router = express.Router();
const entreprise = require('../controllers/entrepriseController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { roleMiddleware } = require('../middlewares/roleMiddleware');

router.use(authMiddleware);

// Création entreprise → super_admin seulement
router.post('/', roleMiddleware(['super_admin']), entreprise.createEntreprise);

// Liste entreprises → tous rôles mais filtré pour manager/employe
router.get('/', roleMiddleware(['super_admin','admin_entreprise','manager','employe']), entreprise.getAllEntreprises);

// Entreprise par ID → filtrage pour manager/employe
router.get('/:id', roleMiddleware(['super_admin','admin_entreprise','manager','employe']), entreprise.getEntrepriseById);

// Mise à jour → super_admin
router.put('/:id', roleMiddleware(['super_admin']), entreprise.updateEntreprise);

// Suppression → super_admin
router.delete('/:id', roleMiddleware(['super_admin']), entreprise.deleteEntreprise);

module.exports = router;
