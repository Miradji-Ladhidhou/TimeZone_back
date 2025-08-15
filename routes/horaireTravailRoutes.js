const express = require('express');
const router = express.Router();
const horaireController = require('../controllers/horaireTravailController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { roleMiddleware } = require('../middlewares/roleMiddleware');

router.use(authMiddleware);

router.post('/', roleMiddleware(['super_admin','admin_entreprise']), horaireController.createHoraire);
router.get('/', roleMiddleware(['super_admin','admin_entreprise','manager','employe']), horaireController.getAllHoraires);
router.get('/:id', roleMiddleware(['super_admin','admin_entreprise','manager','employe']), horaireController.getHoraireById);
router.put('/:id', roleMiddleware(['super_admin','admin_entreprise']), horaireController.updateHoraire);
router.delete('/:id', roleMiddleware(['super_admin','admin_entreprise']), horaireController.deleteHoraire);

module.exports = router;
