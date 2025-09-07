const roleMiddleware = (allowedRoles = []) => {
  return (req, res, next) => {
    // Vérifier que authMiddleware a été exécuté
    if (!req.user || !req.user.role) {
      return res.status(403).json({ error: 'Rôle non défini. Assurez-vous que authMiddleware est appliqué avant.' });
    }

    // Vérifier si le rôle est autorisé
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Accès refusé : rôle non autorisé',
        roleActuel: req.user.role
      });
    }

    next();
  };
};

module.exports = { roleMiddleware };
