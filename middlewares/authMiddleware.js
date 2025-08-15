const jwt = require('jsonwebtoken');
const { Utilisateur } = require('../models');
require('dotenv').config();

exports.authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Token manquant' });

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await Utilisateur.findByPk(decoded.id);
    if (!user) return res.status(401).json({ error: 'Utilisateur non trouvé' });

    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Token invalide' });
  }
};
