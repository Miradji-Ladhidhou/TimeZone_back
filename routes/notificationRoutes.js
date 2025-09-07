const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notificationController");

// Créer une notification
router.post("/", notificationController.createNotification);

// Récupérer notifications d’un utilisateur
router.get("/:utilisateurId", notificationController.getNotificationsByUser);

// Marquer comme lue
router.put("/:id/read", notificationController.markAsRead);

module.exports = router;
