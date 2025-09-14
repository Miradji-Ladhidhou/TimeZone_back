const express = require('express');
const router = express.Router();
const auth = require('../controllers/authController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { roleMiddleware } = require('../middlewares/roleMiddleware');
const { Utilisateur } = require('../models');

router.post('/login', auth.login);

// self-service
router.post('/change-password', authMiddleware, auth.changeMyPassword);

// reset par super_admin / admin_entreprise
router.post('/reset-password', authMiddleware, roleMiddleware(['super_admin','admin_entreprise']), auth.resetPassword);

// Récupérer les informations de l'utilisateur connecté
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await Utilisateur.findByPk(req.user.id, {
      attributes: ['id', 'nom', 'prenom', 'email', 'role', 'entrepriseId'],
    });

    if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' });

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
