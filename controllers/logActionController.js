const { LogAction, Utilisateur } = require("../models");

// Créer un log
exports.createLog = async (req, res) => {
  try {
    const { utilisateurId, action, tableCible, elementId, details } = req.body;

    const log = await LogAction.create({
      utilisateurId,
      action,
      tableCible,
      elementId,
      details,
    });

    res.status(201).json(log);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Impossible de créer le log" });
  }
};

// Récupérer tous les logs
exports.getAllLogs = async (req, res) => {
  try {
    const logs = await LogAction.findAll({
      include: [{ model: Utilisateur, as: "utilisateur", attributes: ["id", "nom", "prenom", "email"] }],
      order: [["dateAction", "DESC"]],
    });

    res.json(logs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Impossible de récupérer les logs" });
  }
};

// Récupérer un log par ID
exports.getLogById = async (req, res) => {
  try {
    const log = await LogAction.findByPk(req.params.id, {
      include: [{ model: Utilisateur, as: "utilisateur", attributes: ["id", "nom", "prenom", "email"] }],
    });

    if (!log) return res.status(404).json({ error: "Log non trouvé" });

    res.json(log);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Impossible de récupérer le log" });
  }
};
