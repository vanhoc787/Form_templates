const AppDataSource = require("../config/dataSource");

exports.createEvaluation = async (evaluationData) => {
    const evaluationRepository = AppDataSource.getRepository("Evaluation");
    const newEvaluation = evaluationRepository.create({ ...evaluationData });
    await evaluationRepository.save(newEvaluation);
    return newEvaluation;
};

exports.getAllEvaluations = async (filters = {}) => {
    const evaluationRepository = AppDataSource.getRepository("Evaluation");
    const role = String(filters.role || '').toLowerCase();
    const department = filters.department || '';
    const branch = filters.branch || '';
    const position = filters.position || '';
    const employeeId = filters.employee_id || '';

    const queryBuilder = evaluationRepository
        .createQueryBuilder('evaluation')
        .orderBy('evaluation.createdAt', 'DESC');

    if (role === 'administrator' || role === 'admin') {
        return await queryBuilder.getMany();
    }

    if (role === 'manager') {
        queryBuilder.where(
            `(
                evaluation.context_info ->> 'dept_id' = :department
                OR evaluation.context_info ->> 'department_name' = :departmentName
            )`,
            { department, departmentName: department }
        );

        if (branch) {
            queryBuilder.andWhere(
                `(
                    evaluation.context_info ->> 'branch_id' = :branch
                    OR evaluation.context_info ->> 'branch_name' = :branchName
                )`,
                { branch, branchName: branch }
            );
        }

        queryBuilder.andWhere("LOWER(evaluation.status) IN ('pendingapproval', 'finished')");
    } else {
        queryBuilder.where('evaluation.employee_id = :employeeId', { employeeId });

        if (position) {
            queryBuilder.andWhere(`evaluation.context_info ->> 'position_id' = :position`, { position });
        }
    }

    return await queryBuilder.getMany();
};

exports.getEvaluationById = async (id) => {
    const evaluationRepository = AppDataSource.getRepository("Evaluation");
    const evaluation = await evaluationRepository.findOne({
        where: { id },
    });

    if (!evaluation) {
        throw new Error("Phiếu đánh giá không tồn tại.");
    }

    return evaluation;
};

exports.updateEvaluation = async (id, updateData) => {
    const evaluationRepository = AppDataSource.getRepository("Evaluation");
    const existingEvaluation = await evaluationRepository.findOne({
        where: { id },
    });

    if (!existingEvaluation) {
        throw new Error("Phiếu đánh giá không tìm thấy.");
    }

    Object.assign(existingEvaluation, updateData);
    await evaluationRepository.save(existingEvaluation);

    return existingEvaluation;
};

exports.toggleEvaluationStatus = async (id) => {
    const evaluationRepository = AppDataSource.getRepository("Evaluation");
    const existingEvaluation = await evaluationRepository.findOne({
        where: { id },
    });

    if (!existingEvaluation) {
        throw new Error("Phiếu đánh giá không tìm thấy.");
    }

    const newStatus = existingEvaluation.status === 'active' ? 'disabled' : 'active';
    existingEvaluation.status = newStatus;
    await evaluationRepository.save(existingEvaluation);

    return existingEvaluation;
};

exports.deleteEvaluationById = async (id) => {
    const evaluationRepository = AppDataSource.getRepository("Evaluation");
    const evaluation = await evaluationRepository.findOne({
        where: { id },
    });

    if (!evaluation) {
        throw new Error("Phiếu đánh giá không tồn tại.");
    }

    await evaluationRepository.remove(evaluation);
    return { success: true, message: "Phiếu đánh giá đã được xóa thành công." };
};

exports.updateEvaluationById = async (id, dataUpdate) => {
    const evaluationRepository = AppDataSource.getRepository("Evaluation");
    const evaluation = await evaluationRepository.findOne({
        where: { id },
    });

    if (!evaluation) {
        throw new Error("Phiếu đánh giá không tồn tại.");
    }

    Object.assign(evaluation, dataUpdate);
    await evaluationRepository.save(evaluation);
    return { success: true, message: "Phiếu đánh giá đã được cập nhật thành công." };
};