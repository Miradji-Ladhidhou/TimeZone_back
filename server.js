require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models');

// Import des routes
const entrepriseRoutes = require('./routes/entrepriseRoutes');
const utilisateurRoutes = require('./routes/utilisateurRoutes');
const congeRoutes = require('./routes/congeRoutes');
const dateBloqueeRoutes = require('./routes/dateBloqueeRoutes');
const horaireTravailRoutes = require('./routes/horaireTravailRoutes');
const regleHeuresSuppRoutes = require('./routes/regleHeuresSuppRoutes');
const pointageRoutes = require('./routes/pointageRoutes');

// Middlewares
const { authMiddleware } = require('./middlewares/authMiddleware');

const app = express();

// Middlewares globaux
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/entreprises', entrepriseRoutes);
app.use('/api/utilisateurs', utilisateurRoutes);
app.use('/api/conges', congeRoutes);
app.use('/api/dates-bloquees', dateBloqueeRoutes);
app.use('/api/horaires-travail', horaireTravailRoutes);
app.use('/api/regles-heures-supp', regleHeuresSuppRoutes);
app.use('/api/pointages', pointageRoutes);

// Test route
app.get('/', (req, res) => res.json({ message: 'API TimeZone SaaS fonctionne !' }));

// Synchronisation DB et démarrage serveur
const PORT = process.env.PORT || 5050;

sequelize.sync({ alter: true }) // ou { force: true } si besoin réinitialiser la DB
  .then(() => {
    console.log('Connexion à la base OK');
    app.listen(PORT, () => console.log(`Serveur démarré sur http://localhost:${PORT}`));
  })
  .catch(err => console.error('Erreur connexion DB:', err));
