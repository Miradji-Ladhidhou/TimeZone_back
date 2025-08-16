const { Entreprise, Utilisateur } = require('../models');
const bcrypt = require('bcrypt');

// super_admin: créer entreprise + (optionnel) admin initial
exports.createEntreprise = async (req, res) => {
  try {
    const { nom, adresse, pays, fuseau_horaire, admin } = req.body;
    const entreprise = await Entreprise.create({ nom, adresse, pays, fuseau_horaire });

    // si payload admin fourni → créer l’admin_entreprise
    if (admin && admin.email && admin.mot_de_passe && admin.nom) {
      const hash = await bcrypt.hash(admin.mot_de_passe, 10);
      await Utilisateur.create({
        nom: admin.nom,
        prenom: admin.prenom || null,
        email: admin.email,
        mot_de_passe: hash,
        role: 'admin_entreprise',
        actif: true,
        entrepriseId: entreprise.id,
      });
    }

    res.status(201).json(entreprise);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getAllEntreprises = async (_req, res) => {
  try {
    const entreprises = await Entreprise.findAll();
    res.json(entreprises);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getEntrepriseById = async (req, res) => {
  try {
    const entreprise = await Entreprise.findByPk(req.params.id);
    if (!entreprise) return res.status(404).json({ error: 'Entreprise non trouvée' });
    res.json(entreprise);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateEntreprise = async (req, res) => {
  try {
    const entreprise = await Entreprise.findByPk(req.params.id);
    if (!entreprise) return res.status(404).json({ error: 'Entreprise non trouvée' });
    await entreprise.update(req.body);
    res.json(entreprise);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteEntreprise = async (req, res) => {
  try {
    const entreprise = await Entreprise.findByPk(req.params.id);
    if (!entreprise) return res.status(404).json({ error: 'Entreprise non trouvée' });
    await entreprise.destroy();
    res.json({ message: 'Entreprise supprimée avec succès' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
