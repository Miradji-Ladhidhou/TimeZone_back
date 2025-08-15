const express = require('express');
const router = express.Router();
const entrepriseController = require('../controllers/entrepriseController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { roleMiddleware } = require('../middlewares/roleMiddleware');

router.use(authMiddleware);

router.post('/', roleMiddleware(['super_admin']), entrepriseController.createEntreprise);
router.get('/', roleMiddleware(['super_admin', 'admin_entreprise', 'manager', 'employe']), entrepriseController.getAllEntreprises);
router.get('/:id', roleMiddleware(['super_admin', 'admin_entreprise', 'manager', 'employe']), entrepriseController.getEntrepriseById);
router.put('/:id', roleMiddleware(['super_admin']), entrepriseController.updateEntreprise);
router.delete('/:id', roleMiddleware(['super_admin']), entrepriseController.deleteEntreprise);

module.exports = router;
