const express = require('express');
const router = express.Router();
const dateController = require('../controllers/dateBloqueeController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { roleMiddleware } = require('../middlewares/roleMiddleware');

router.use(authMiddleware);

router.post('/', roleMiddleware(['super_admin','admin_entreprise']), dateController.createDateBloquee);
router.get('/', roleMiddleware(['super_admin','admin_entreprise','manager','employe']), dateController.getAllDatesBloquees);
router.get('/:id', roleMiddleware(['super_admin','admin_entreprise','manager','employe']), dateController.getDateBloqueeById);
router.put('/:id', roleMiddleware(['super_admin','admin_entreprise']), dateController.updateDateBloquee);
router.delete('/:id', roleMiddleware(['super_admin','admin_entreprise']), dateController.deleteDateBloquee);

module.exports = router;
