const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const protect = require("../middleware/auth.middleware").protect;
const authorize  = require("../middleware/auth.middleware").authorize;
const evaluationController = require("../controllers/evaluation.comtroller");

// Định nghĩa route: POST /api/users/create
router.post(
    "/create",
    protect, // 1. Yêu cầu đăng nhập
    evaluationController.createEvaluation // 4. Xử lý logic
);

// Định nghĩa route: GET /api/users
router.get(
    "/",
    protect, // 1. Yêu cầu đăng nhập
    evaluationController.getAllEvaluations // 3. Xử lý logic
);

// Định nghĩa route: GET /api/users/:id
router.get(
    "/:id",
    protect, // 1. Yêu cầu đăng nhập
    evaluationController.getEvaluationById // 3. Xử lý logic
);

// Định nghĩa route: PUT /api/users/:id - Update evaluation
router.put(
    "/:id",
    protect, // 1. Yêu cầu đăng nhập
    evaluationController.updateEvaluation // 4. Xử lý logic
);

// Định nghĩa route: PATCH /api/users/:id/status - Toggle user status (enable/disable)
router.patch(
    "/:id/status",
    protect, // 1. Yêu cầu đăng nhập
    evaluationController.toggleEvaluationStatus // 3. Xử lý logic
);

router.delete(
    "/:id",
    protect, // 1. Yêu cầu đăng nhập
    evaluationController.deleteEvaluationById // 3. Xử lý logic
);

router.patch(
    "/:id",
    protect, // 1. Yêu cầu đăng nhập
    evaluationController.updateEvaluationById // 3. Xử lý logic
);


module.exports = router;