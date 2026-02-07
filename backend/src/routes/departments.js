/**
 * Department API routes
 * POST /api/departments - create (validated)
 * PUT /api/departments/:id - update (validated)
 * DELETE /api/departments/:id - soft (default) or hard delete
 */

const express = require('express');
const router = express.Router();
const { asyncHandler } = require('../middleware/errorHandler');
const { authenticate, requireAgencyContext } = require('../middleware/authMiddleware');
const { success, error: errorResponse } = require('../utils/responseHelper');
const departmentService = require('../services/departmentService');

router.get(
  '/stats',
  authenticate,
  requireAgencyContext,
  asyncHandler(async (req, res) => {
    const agencyDatabase = req.user.agencyDatabase;
    const stats = await departmentService.getDepartmentStats(agencyDatabase);
    return res.json(success(stats));
  })
);

router.get(
  '/',
  authenticate,
  requireAgencyContext,
  asyncHandler(async (req, res) => {
    const agencyDatabase = req.user.agencyDatabase;
    const query = req.query || {};
    const result = await departmentService.listDepartments(
      {
        limit: query.limit,
        offset: query.offset,
        sortBy: query.sortBy,
        sortDir: query.sortDir,
        search: query.search,
        is_active: query.is_active,
        manager_id: query.manager_id,
        parent_department_id: query.parent_department_id,
        min_budget: query.min_budget,
        max_budget: query.max_budget,
      },
      agencyDatabase
    );
    return res.json(success({ departments: result.rows, total: result.total }, null, { total: result.total }));
  })
);

router.post(
  '/',
  authenticate,
  requireAgencyContext,
  asyncHandler(async (req, res) => {
    const agencyDatabase = req.user.agencyDatabase;
    const userId = req.user.userId;
    const body = req.body || {};
    const result = await departmentService.validateAndCreate(
      {
        name: body.name,
        description: body.description,
        manager_id: body.manager_id,
        parent_department_id: body.parent_department_id,
        budget: body.budget,
        agency_id: body.agency_id,
      },
      agencyDatabase,
      userId
    );
    if (!result.success) {
      const status = result.error === 'VALIDATION_ERROR' ? 400 : result.error === 'NOT_FOUND' ? 404 : 500;
      return res.status(status).json(errorResponse(result.message, result.error, { message: result.message }));
    }
    return res.status(201).json(success(result.data, result.message));
  })
);

router.put(
  '/:id',
  authenticate,
  requireAgencyContext,
  asyncHandler(async (req, res) => {
    const agencyDatabase = req.user.agencyDatabase;
    const userId = req.user.userId;
    const id = req.params.id;
    const body = req.body || {};
    const result = await departmentService.validateAndUpdate(
      id,
      {
        name: body.name,
        description: body.description,
        manager_id: body.manager_id,
        parent_department_id: body.parent_department_id,
        budget: body.budget,
        is_active: body.is_active,
      },
      agencyDatabase,
      userId
    );
    if (!result.success) {
      const status = result.error === 'VALIDATION_ERROR' ? 400 : result.error === 'NOT_FOUND' ? 404 : 500;
      return res.status(status).json(errorResponse(result.message, result.error, { message: result.message }));
    }
    return res.json(success(result.data, result.message));
  })
);

router.delete(
  '/:id',
  authenticate,
  requireAgencyContext,
  asyncHandler(async (req, res) => {
    const agencyDatabase = req.user.agencyDatabase;
    const id = req.params.id;
    const hard = req.query.hard === 'true' || req.body?.hard === true;
    const result = await departmentService.deleteDepartment(id, hard, agencyDatabase);
    if (!result.success) {
      const status = result.error === 'NOT_FOUND' ? 404 : 500;
      return res.status(status).json(errorResponse(result.message, result.error, { message: result.message }));
    }
    return res.json(success(result.data, result.message));
  })
);

module.exports = router;
