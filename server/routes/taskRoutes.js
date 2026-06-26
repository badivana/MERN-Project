const express = require("express");
const router = express.Router();
const taskController = require("../controllers/taskController");
const authMiddleware = require("../middleware/auth");

// All task routes require authentication
router.use(authMiddleware);

// Analytics summary (Must be before /:id)
router.get("/analytics", taskController.getAnalytics);

// Standard CRUD
router.get("/", taskController.getTasks);
router.post("/", taskController.createTask);
router.put("/:id", taskController.updateTask);
router.delete("/:id", taskController.deleteTask);

module.exports = router;
