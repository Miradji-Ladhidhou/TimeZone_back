const express = require("express");
const router = express.Router();
const logActionController = require("../controllers/logActionController");

// Routes CRUD
router.post("/", logActionController.createLog);
router.get("/", logActionController.getAllLogs);
router.get("/:id", logActionController.getLogById);

module.exports = router;
