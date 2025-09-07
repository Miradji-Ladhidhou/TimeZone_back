const { Notification, Utilisateur } = require("../models");

// Créer une notification
exports.createNotification = async (req, res) => {
  try {
    const { utilisateur_id, type, message } = req.body;

    const notif = await Notification.create({ utilisateur_id, type, message });

    res.status(201).json(notif);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Récupérer toutes les notifications d’un utilisateur
exports.getNotificationsByUser = async (req, res) => {
  try {
    const { utilisateurId } = req.params;

    const notifs = await Notification.findAll({
      where: { utilisateur_id: utilisateurId },
      order: [["date_creation", "DESC"]]
    });

    res.json(notifs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Marquer une notification comme lue
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const notif = await Notification.findByPk(id);
    if (!notif) return res.status(404).json({ error: "Notification introuvable" });

    notif.lu = true;
    await notif.save();

    res.json({ message: "Notification marquée comme lue", notif });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
