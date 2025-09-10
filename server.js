require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const jwt = require('jsonwebtoken');
const { sequelize } = require('./models');

// Routes
const entrepriseRoutes = require('./routes/entrepriseRoutes');
const utilisateurRoutes = require('./routes/utilisateurRoutes');
const congeRoutes = require('./routes/congeRoutes');
const dateBloqueeRoutes = require('./routes/dateBloqueeRoutes');
const horaireTravailRoutes = require('./routes/horaireTravailRoutes');
const regleHeureSuppRoutes = require('./routes/regleHeureSuppRoutes');
const pointageRoutes = require('./routes/pointageRoutes');
const authRoutes = require('./routes/authRoutes');
const soldeCongeRoutes = require('./routes/soldeCongeRoutes');
const jourFerieRoutes = require('./routes/jourFerieRoutes');
const logActionRoutes = require('./routes/logActionRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

const app = express();

// ------------------
// Middlewares globaux
// ------------------
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// ------------------
// Middleware auth JWT
// ------------------
function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ error: 'Token manquant' });

  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token invalide' });

  jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {
    if (err) return res.status(401).json({ error: 'Token invalide ou expiré' });
    req.user = payload;
    next();
  });
}

// ------------------
// Middleware rôle
// ------------------
function roleMiddleware(roles = []) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) return res.status(403).json({ error: 'Accès refusé' });
    next();
  };
}

// ------------------
// Routes publiques
// ------------------
app.use('/api/auth', authRoutes); // login, refresh token, register si besoin

// ------------------
// Routes sécurisées (JWT)
app.use(authMiddleware);

app.use('/api/entreprises', entrepriseRoutes);
app.use('/api/utilisateurs', utilisateurRoutes);
app.use('/api/conges', congeRoutes);
app.use('/api/dates-bloquees', dateBloqueeRoutes);
app.use('/api/horaires-travail', horaireTravailRoutes);
app.use('/api/regles-heures-supp', regleHeureSuppRoutes);
app.use('/api/pointages', pointageRoutes);
app.use('/api/solde-conges', soldeCongeRoutes);
app.use('/api/jours-feries', jourFerieRoutes);
app.use('/api/logs-actions', logActionRoutes);
app.use('/api/notifications', notificationRoutes);

// ------------------
// Route test
// ------------------
app.get('/', (req, res) => res.json({ message: 'API TimeZone SaaS sécurisée fonctionne !' }));

// ------------------
// Middleware global d'erreurs
// ------------------
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ error: err.message || 'Erreur interne du serveur' });
});

// ------------------
// Démarrage serveur
// ------------------
const PORT = process.env.PORT || 5050;
(async () => {
  try {
    if (process.env.NODE_ENV !== 'production') {
      await sequelize.sync();
    } else {
      await sequelize.authenticate();
      console.log('Connexion DB OK');
    }

    app.listen(PORT, () => console.log(`Serveur sécurisé démarré sur http://localhost:${PORT}`));
  } catch (err) {
    console.error('Erreur connexion DB:', err);
    process.exit(1);
  }
})();
