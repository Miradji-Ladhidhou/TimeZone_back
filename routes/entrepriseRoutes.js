const express = require('express');
const router = express.Router();
const entreprise = require('../controllers/entrepriseController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { roleMiddleware } = require('../middlewares/roleMiddleware');

router.use(authMiddleware);

router.post('/', roleMiddleware(['super_admin']), entreprise.createEntreprise);
router.get('/', roleMiddleware(['super_admin','admin_entreprise','manager','employe']), entreprise.getAllEntreprises);
router.get('/:id', roleMiddleware(['super_admin','admin_entreprise','manager','employe']), entreprise.getEntrepriseById);
router.put('/:id', roleMiddleware(['super_admin']), entreprise.updateEntreprise);
router.delete('/:id', roleMiddleware(['super_admin']), entreprise.deleteEntreprise);

module.exports = router;
