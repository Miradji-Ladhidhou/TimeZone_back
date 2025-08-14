const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Utilisateur } = require('../models');

exports.register = async (req, res) => {
  try {
    const { nom, prenom, email, mot_de_passe, entrepriseId, role } = req.body;

    // Hash du mot de passe
    const hash = await bcrypt.hash(mot_de_passe, 10);

    const user = await Utilisateur.create({
      nom,
      prenom,
      email,
      mot_de_passe: hash,
      entrepriseId,
      role,
    });

    res.status(201).json({ message: 'Utilisateur créé', userId: user.id });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, mot_de_passe } = req.body;

    const user = await Utilisateur.findOne({ where: { email } });
    if (!user) return res.status(401).json({ error: 'Email ou mot de passe invalide' });

    const match = await bcrypt.compare(mot_de_passe, user.mot_de_passe);
    if (!match) return res.status(401).json({ error: 'Email ou mot de passe invalide' });

    // Générer JWT
    const token = jwt.sign(
      { id: user.id, entrepriseId: user.entrepriseId, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
