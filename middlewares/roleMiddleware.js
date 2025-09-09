const roleMiddleware = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      console.warn(`Tentative d'accès non authentifiée à ${req.method} ${req.originalUrl}`);
      return res.status(401).json({ error: 'Utilisateur non authentifié. AuthMiddleware requis.' });
    }

    const { id, role, entrepriseId } = req.user;

    // Si le rôle n’est pas autorisé, log détaillé
    if (!allowedRoles.includes(role)) {
      console.warn(
        `ACCES REFUSE : User ${id} | Rôle : ${role} | Entreprise : ${entrepriseId || 'N/A'} | ` +
        `Méthode : ${req.method} | URL : ${req.originalUrl}`
      );
      return res.status(403).json({ 
        error: 'Accès refusé : rôle non autorisé',
        roleActuel: role
      });
    }

    // Pour le debug léger : accès autorisé
    console.log(`ACCES AUTORISE : User ${id} | Rôle : ${role} | Méthode : ${req.method} | URL : ${req.originalUrl}`);

    next();
  };
};

module.exports = { roleMiddleware };
