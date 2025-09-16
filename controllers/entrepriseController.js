const { Entreprise, Utilisateur } = require('../models');
const bcrypt = require('bcrypt');

// Super admin : créer entreprise + admin initial optionnel
exports.createEntreprise = async (req, res) => {
  try {
    const { nom, email, telephone, adresse, pays, fuseauHoraire, admin } = req.body;

    if (!nom) return res.status(400).json({ error: "Nom de l'entreprise requis" });

    const entreprise = await Entreprise.create({ nom, email, telephone, adresse, pays, fuseauHoraire });

    // Création admin_entreprise si fourni
    if (admin && admin.email && admin.motDePasse && admin.nom) {
      const existingAdmin = await Utilisateur.findOne({ where: { email: admin.email } });
      if (existingAdmin) return res.status(400).json({ error: "Email admin déjà utilisé" });

      const hash = await bcrypt.hash(admin.motDePasse, 10);
      await Utilisateur.create({
        nom: admin.nom,
        prenom: admin.prenom || null,
        email: admin.email,
        motDePasse: hash,
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

// Récupérer toutes les entreprises selon rôle
exports.getAllEntreprises = async (req, res) => {
  try {
    let where = {};
    if (req.user.role === "employe" || req.user.role === "manager") {
      where = { id: req.user.entrepriseId };
    }
    const entreprises = await Entreprise.findAll({ where });
    res.json(entreprises);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Récupérer entreprise par ID
exports.getEntrepriseById = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: "ID invalide" });

    const entreprise = await Entreprise.findByPk(id);
    if (!entreprise) return res.status(404).json({ error: "Entreprise non trouvée" });

    // Filtrage pour manager/employe
    if ((req.user.role === "manager" || req.user.role === "employe") && req.user.entrepriseId !== id) {
      return res.status(403).json({ error: "Accès refusé" });
    }

    res.json(entreprise);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Mettre à jour entreprise (super_admin uniquement)
exports.updateEntreprise = async (req, res) => {
  try {
    if (req.user.role !== "super_admin") {
      return res.status(403).json({ error: "Accès refusé" });
    }

    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: "ID invalide" });

    const entreprise = await Entreprise.findByPk(id);
    if (!entreprise) return res.status(404).json({ error: "Entreprise non trouvée" });

    // Filtrer champs autorisés
    const allowed = ['nom', 'email', 'telephone', 'adresse', 'pays', 'fuseauHoraire'];
    const data = {};
    allowed.forEach(field => { if (req.body[field] !== undefined) data[field] = req.body[field] });

    await entreprise.update(data);
    res.json(entreprise);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Supprimer entreprise (super_admin uniquement)
exports.deleteEntreprise = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: "ID invalide" });

    const entreprise = await Entreprise.findByPk(id);
    if (!entreprise) return res.status(404).json({ error: "Entreprise non trouvée" });

    await entreprise.destroy();
    res.json({ message: "Entreprise supprimée avec succès" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
