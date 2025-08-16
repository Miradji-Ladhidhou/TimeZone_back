const express = require('express');
const router = express.Router();
const user = require('../controllers/utilisateurController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { roleMiddleware } = require('../middlewares/roleMiddleware');

router.use(authMiddleware);

router.post('/', roleMiddleware(['super_admin','admin_entreprise']), user.createUtilisateur);
router.get('/', roleMiddleware(['super_admin','admin_entreprise','manager','employe']), user.getAllUtilisateurs);
router.get('/:id', roleMiddleware(['super_admin','admin_entreprise','manager','employe']), user.getUtilisateurById);
router.put('/:id', roleMiddleware(['super_admin','admin_entreprise','manager','employe']), user.updateUtilisateur);
router.delete('/:id', roleMiddleware(['super_admin','admin_entreprise']), user.deleteUtilisateur);

module.exports = router;
