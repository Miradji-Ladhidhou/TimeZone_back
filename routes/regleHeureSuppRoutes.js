const express = require('express');
const router = express.Router();
const regleController = require('../controllers/regleHeuresSuppController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { roleMiddleware } = require('../middlewares/roleMiddleware');

router.use(authMiddleware);

router.post('/', roleMiddleware(['super_admin','admin_entreprise']), regleController.createRegle);
router.get('/', roleMiddleware(['super_admin','admin_entreprise','manager','employe']), regleController.getAllRegles);
router.get('/:id', roleMiddleware(['super_admin','admin_entreprise','manager','employe']), regleController.getRegleById);
router.put('/:id', roleMiddleware(['super_admin','admin_entreprise']), regleController.updateRegle);
router.delete('/:id', roleMiddleware(['super_admin','admin_entreprise']), regleController.deleteRegle);

module.exports = router;
