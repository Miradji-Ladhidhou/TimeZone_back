const express = require('express');
const router = express.Router();
const pointageController = require('../controllers/pointageController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { roleMiddleware } = require('../middlewares/roleMiddleware');

router.use(authMiddleware);

router.post('/', roleMiddleware(['super_admin','admin_entreprise','manager','employe']), pointageController.createPointage);
router.get('/', roleMiddleware(['super_admin','admin_entreprise','manager','employe']), pointageController.getAllPointages);
router.get('/:id', roleMiddleware(['super_admin','admin_entreprise','manager','employe']), pointageController.getPointageById);
router.put('/:id', roleMiddleware(['super_admin','admin_entreprise','manager','employe']), pointageController.updatePointage);
router.delete('/:id', roleMiddleware(['super_admin','admin_entreprise','employe']), pointageController.deletePointage);

module.exports = router;
