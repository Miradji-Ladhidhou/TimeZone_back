const express = require('express');
const router = express.Router();
const auth = require('../controllers/authController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { roleMiddleware } = require('../middlewares/roleMiddleware');

router.post('/login', auth.login);

// self-service
router.post('/change-password', authMiddleware, auth.changeMyPassword);

// reset par super_admin / admin_entreprise
router.post('/reset-password', authMiddleware, roleMiddleware(['super_admin','admin_entreprise']), auth.resetPassword);

module.exports = router;
