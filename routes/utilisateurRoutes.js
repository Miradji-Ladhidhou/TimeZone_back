const express = require('express');
const router = express.Router();
const utilisateurController = require('../controllers/utilisateurController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { roleMiddleware } = require('../middlewares/roleMiddleware');

// Middleware global : authentification obligatoire
router.use(authMiddleware);

// Création utilisateur (super_admin et admin_entreprise uniquement)
router.post(
  '/',
  roleMiddleware(['super_admin', 'admin_entreprise']),
  utilisateurController.createUtilisateur
);

// Liste utilisateurs
router.get(
  '/',
  roleMiddleware(['super_admin', 'admin_entreprise', 'manager', 'employe']),
  utilisateurController.getAllUtilisateurs
);

// Détail utilisateur par ID
router.get(
  '/:id',
  roleMiddleware(['super_admin', 'admin_entreprise', 'manager', 'employe']),
  utilisateurController.getUtilisateurById
);

// Mise à jour utilisateur
router.put(
  '/:id',
  roleMiddleware(['super_admin', 'admin_entreprise', 'manager', 'employe']),
  async (req, res, next) => {
    // Filtrage des champs sensibles avant de passer au controller
    const safeFields = ['nom', 'prenom', 'email', 'mot_de_passe', 'date_embauche'];
    
    // Si super_admin, on permet aussi la modification de role et entrepriseId
    if (req.user.role === 'super_admin') {
      safeFields.push('role', 'entrepriseId', 'actif');
    }

    // Filtrer req.body pour n'inclure que les champs autorisés
    req.body = Object.keys(req.body)
      .filter(key => safeFields.includes(key))
      .reduce((obj, key) => {
        obj[key] = req.body[key];
        return obj;
      }, {});

    next();
  },
  utilisateurController.updateUtilisateur
);

// Suppression utilisateur (super_admin et admin_entreprise uniquement)
router.delete(
  '/:id',
  roleMiddleware(['super_admin', 'admin_entreprise']),
  utilisateurController.deleteUtilisateur
);

module.exports = router;
