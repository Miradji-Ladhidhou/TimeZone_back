const { Entreprise } = require('../models');

// Créer une entreprise (super_admin seulement)
exports.createEntreprise = async (req, res) => {
  try {
    const entreprise = await Entreprise.create(req.body);
    res.status(201).json(entreprise);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Récupérer toutes les entreprises
exports.getAllEntreprises = async (req, res) => {
  try {
    const entreprises = await Entreprise.findAll();
    res.json(entreprises);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Récupérer entreprise par ID
exports.getEntrepriseById = async (req, res) => {
  try {
    const entreprise = await Entreprise.findByPk(req.params.id);
    if (!entreprise) return res.status(404).json({ error: 'Entreprise non trouvée' });
    res.json(entreprise);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Mettre à jour une entreprise
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

// Supprimer une entreprise
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
