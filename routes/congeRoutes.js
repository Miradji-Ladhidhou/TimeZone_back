const express = require('express');
const router = express.Router();
const congeController = require('../controllers/congeController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { roleMiddleware } = require('../middlewares/roleMiddleware');

router.use(authMiddleware);

router.post('/', roleMiddleware(['super_admin','admin_entreprise','manager','employe']), congeController.createConge);
router.get('/', roleMiddleware(['super_admin','admin_entreprise','manager','employe']), congeController.getAllConges);
router.get('/:id', roleMiddleware(['super_admin','admin_entreprise','manager','employe']), congeController.getCongeById);
router.put('/:id', roleMiddleware(['super_admin','admin_entreprise','manager','employe']), congeController.updateConge);
router.delete('/:id', roleMiddleware(['super_admin','admin_entreprise','employe']), congeController.deleteConge);

module.exports = router;
