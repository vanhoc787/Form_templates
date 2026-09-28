const { validationResult } = require("express-validator");
const evaluationService = require("../services/evaluation.services");

exports.createEvaluation = async (req, res) => {
    // 1. Kiểm tra kết quả validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        // 2. Gọi service để tạo evaluation
        const newEvaluation = await evaluationService.createEvaluation(req.body);
        res.status(201).json({
            success: true,
            message: "Tạo đánh giá thành công!",
            evaluation: newEvaluation,
        });
    } catch (error) {
        // 3. Xử lý lỗi (ví dụ: username đã tồn tại)
        res.status(409).json({ success: false, message: error.message });
    }
};

exports.getAllEvaluations = async (req, res) => {
    try {
        const currentUser = req.user || {};
        const filters = {
            role: req.query.role || currentUser.role,
            department: req.query.department || currentUser.dept,
            branch: req.query.branch || currentUser.branch_code,
            position: req.query.position || '',
            employee_id: currentUser.employee_code || currentUser.sub,
        };

        const evaluations = await evaluationService.getAllEvaluations(filters);
        res.status(200).json({
            success: true,
            evaluations: evaluations,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

exports.getEvaluationById = async (req, res) => {
    const { id } = req.params;
    try {
        // 1. Gọi service để lấy đánh giá theo ID
        const evaluation = await evaluationService.getEvaluationById(id);
        res.status(200).json({
            success: true,
            evaluation: evaluation,
        });
    } catch (error) {
        // 2. Xử lý lỗi nếu người dùng không tồn tại
        res.status(404).json({ success: false, message: error.message });
    }
}

/**
 * Update evaluation by ID
 */
exports.updateEvaluation = async (req, res) => {
    // 1. Kiểm tra kết quả validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ 
            success: false,
            message: "Dữ liệu không hợp lệ.",
            errors: errors.array() 
        });
    }

    const { id } = req.params;

    try {
        // 2. Gọi service để cập nhật evaluation
        const updatedEvaluation = await evaluationService.updateEvaluation(id, req.body);
        res.status(200).json({
            success: true,
            message: "Cập nhật đánh giá thành công!",
            evaluation: updatedEvaluation,
        });
    } catch (error) {
        // 3. Xử lý lỗi (ví dụ: evaluation không tồn tại, username đã tồn tại)
        if (error.message.includes('không tìm thấy')) {
            res.status(404).json({ success: false, message: error.message });
        } else if (error.message.includes('đã tồn tại')) {
            res.status(409).json({ success: false, message: error.message });
        } else {
            res.status(500).json({ success: false, message: error.message });
        }
    }
};

/**
 * Toggle evaluation status (enable/disable)
 */
exports.toggleEvaluationStatus = async (req, res) => {
    const { id } = req.params;

    try {
        // Gọi service để toggle evaluation status
        const updatedEvaluation = await evaluationService.toggleEvaluationStatus(id);
        res.status(200).json({
            success: true,
            message: `Đã ${updatedEvaluation.status === 'active' ? 'kích hoạt' : 'vô hiệu hóa'} đánh giá thành công!`,
            evaluation: updatedEvaluation,
        });
    } catch (error) {
        // Xử lý lỗi (ví dụ: evaluation không tồn tại)
        if (error.message.includes('không tìm thấy')) {
            res.status(404).json({ success: false, message: error.message });
        } else {
            res.status(500).json({ success: false, message: error.message });
        }
    }
};

exports.deleteEvaluationById = async (req, res) => {
    const { id } = req.params;

    try {
        // 1. Gọi service để xóa đánh giá theo ID
        const result = await evaluationService.deleteEvaluationById(id);
        res.status(200).json(result);
    } catch (error) {
        // 2. Xử lý lỗi nếu đánh giá không tồn tại hoặc không thể xóa
        res.status(404).json({ success: false, message: error.message });
    }
}

exports.updateEvaluationById = async (req, res) => {
    try {
        const id = req.params.id; 
        const dataUpdate = req.body; 
        const result = await evaluationService.updateEvaluationById(id, dataUpdate);
        res.status(200).json(result);
    } catch (error) {
        res.status(404).json({ success: false, message: error.message });
    }
}


