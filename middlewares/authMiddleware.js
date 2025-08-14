const jwt = require('jsonwebtoken');
const { Utilisateur } = require('../models');

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token manquant' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Récupérer l'utilisateur et vérifier qu'il existe
    const user = await Utilisateur.findByPk(decoded.id);
    if (!user || !user.actif) {
      return res.status(401).json({ error: 'Utilisateur non trouvé ou inactif' });
    }

    // Ajouter info utilisateur dans req pour toutes les routes
    req.user = {
      id: user.id,
      entrepriseId: user.entrepriseId,
      role: user.role,
    };

    next();
  } catch (err) {
    res.status(401).json({ error: 'Token invalide' });
  }
};

module.exports = { authMiddleware };
