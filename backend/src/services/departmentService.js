/**
 * Department Service
 * Validates and performs department CRUD with consistent error responses.
 * Used by /api/departments routes.
 */

const { getAgencyPool } = require('../config/database');
const logger = require('../utils/logger');

/**
 * Get all departments (id, name, parent_department_id) for validation
 * @param {Object} client - pg client
 * @returns {Promise<Array<{id: string, name: string, parent_department_id: string|null}>>}
 */
async function getAllDepartments(client) {
  const result = await client.query(
    `SELECT id, name, parent_department_id FROM public.departments ORDER BY name ASC`
  );
  return result.rows;
}

/**
 * Check for duplicate name (excluding given id if edit)
 * @param {Object} client - pg client
 * @param {string} name - trimmed name
 * @param {string|null} excludeId - department id to exclude (when editing)
 * @returns {Promise<boolean>} true if duplicate exists
 */
async function hasDuplicateName(client, name, excludeId = null) {
  let sql = `SELECT 1 FROM public.departments WHERE name = $1 LIMIT 1`;
  const params = [name];
  if (excludeId) {
    sql = `SELECT 1 FROM public.departments WHERE name = $1 AND id != $2 LIMIT 1`;
    params.push(excludeId);
  }
  const result = await client.query(sql, params);
  return result.rows.length > 0;
}

/**
 * Check if setting parentId would create a cycle (parent is descendant of departmentId)
 * @param {Array<{id: string, parent_department_id: string|null}>} allDepts
 * @param {string} departmentId - current department (when editing)
 * @param {string} parentId - proposed parent
 * @returns {boolean}
 */
function wouldCreateCycle(allDepts, departmentId, parentId) {
  if (!parentId || parentId === departmentId) return true;
  const parentMap = new Map(allDepts.map((d) => [d.id, d.parent_department_id]));
  const descendants = new Set();
  let frontier = [departmentId];
  while (frontier.length > 0) {
    const next = [];
    for (const id of frontier) {
      for (const d of allDepts) {
        if (d.parent_department_id === id) {
          descendants.add(d.id);
          next.push(d.id);
        }
      }
    }
    frontier = next;
  }
  return descendants.has(parentId);
}

/**
 * Validate and create a department
 * @param {Object} data - { name, description?, manager_id?, parent_department_id?, budget?, agency_id? }
 * @param {string} agencyDatabase - agency database name
 * @param {string} [userId] - for audit
 * @returns {Promise<{success: boolean, data?: Object, error?: string, message?: string}>}
 */
async function validateAndCreate(data, agencyDatabase, userId = null) {
  const pool = getAgencyPool(agencyDatabase);
  let client;
  try {
    client = await pool.connect();
    const name = (data.name && String(data.name).trim()) || '';
    if (!name) {
      return { success: false, error: 'VALIDATION_ERROR', message: 'Department name is required.' };
    }
    const budget = data.budget != null ? Number(data.budget) : 0;
    if (Number.isNaN(budget) || budget < 0) {
      return { success: false, error: 'VALIDATION_ERROR', message: 'Budget must be a number >= 0.' };
    }
    const parentId = data.parent_department_id && String(data.parent_department_id).trim() ? data.parent_department_id : null;

    const allDepts = await getAllDepartments(client);
    if (await hasDuplicateName(client, name, null)) {
      return { success: false, error: 'VALIDATION_ERROR', message: 'A department with this name already exists.' };
    }
    if (parentId) {
      const parentExists = allDepts.some((d) => d.id === parentId);
      if (!parentExists) {
        return { success: false, error: 'VALIDATION_ERROR', message: 'Parent department not found.' };
      }
    }

    const insertResult = await client.query(
      `INSERT INTO public.departments (name, description, manager_id, parent_department_id, budget, is_active, agency_id, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, true, $6, NOW(), NOW())
       RETURNING *`,
      [
        name,
        data.description && String(data.description).trim() ? data.description.trim() : null,
        data.manager_id && String(data.manager_id).trim() ? data.manager_id : null,
        parentId,
        budget,
        data.agency_id || null,
      ]
    );
    return { success: true, data: insertResult.rows[0], message: 'Department created successfully.' };
  } catch (err) {
    logger.error('departmentService.validateAndCreate', { error: err.message, agencyDatabase });
    return { success: false, error: 'SERVER_ERROR', message: err.message || 'Failed to create department.' };
  } finally {
    if (client) client.release();
  }
}

/**
 * Validate and update a department
 * @param {string} id - department id
 * @param {Object} data - { name?, description?, manager_id?, parent_department_id?, budget? }
 * @param {string} agencyDatabase - agency database name
 * @param {string} [userId] - for audit
 * @returns {Promise<{success: boolean, data?: Object, error?: string, message?: string}>}
 */
async function validateAndUpdate(id, data, agencyDatabase, userId = null) {
  const pool = getAgencyPool(agencyDatabase);
  let client;
  try {
    client = await pool.connect();
    const name = data.name != null ? String(data.name).trim() : null;
    if (name !== null && name === '') {
      return { success: false, error: 'VALIDATION_ERROR', message: 'Department name is required.' };
    }
    const budget = data.budget != null ? Number(data.budget) : null;
    if (budget !== null && (Number.isNaN(budget) || budget < 0)) {
      return { success: false, error: 'VALIDATION_ERROR', message: 'Budget must be a number >= 0.' };
    }

    const existing = await client.query(`SELECT id, name, parent_department_id FROM public.departments WHERE id = $1`, [id]);
    if (existing.rows.length === 0) {
      return { success: false, error: 'NOT_FOUND', message: 'Department not found.' };
    }

    const allDepts = await getAllDepartments(client);
    if (name !== null && (await hasDuplicateName(client, name, id))) {
      return { success: false, error: 'VALIDATION_ERROR', message: 'A department with this name already exists.' };
    }

    const parentId = data.parent_department_id !== undefined
      ? (data.parent_department_id && String(data.parent_department_id).trim() ? data.parent_department_id : null)
      : undefined;
    if (parentId === id) {
      return { success: false, error: 'VALIDATION_ERROR', message: 'A department cannot be its own parent.' };
    }
    if (parentId && wouldCreateCycle(allDepts, id, parentId)) {
      return { success: false, error: 'VALIDATION_ERROR', message: 'Parent would create a cycle.' };
    }

    const updates = [];
    const params = [];
    let idx = 1;
    if (name !== null) { updates.push(`name = $${idx++}`); params.push(name); }
    if (data.description !== undefined) { updates.push(`description = $${idx++}`); params.push(data.description && String(data.description).trim() ? data.description.trim() : null); }
    if (data.manager_id !== undefined) { updates.push(`manager_id = $${idx++}`); params.push(data.manager_id && String(data.manager_id).trim() ? data.manager_id : null); }
    if (parentId !== undefined) { updates.push(`parent_department_id = $${idx++}`); params.push(parentId); }
    if (budget !== null) { updates.push(`budget = $${idx++}`); params.push(budget); }
    if (data.is_active !== undefined) { updates.push(`is_active = $${idx++}`); params.push(!!data.is_active); }
    if (updates.length === 0) {
      return { success: true, data: existing.rows[0], message: 'No changes.' };
    }
    updates.push(`updated_at = NOW()`);
    params.push(id);
    const sql = `UPDATE public.departments SET ${updates.join(', ')} WHERE id = $${idx} RETURNING *`;
    const result = await client.query(sql, params);
    return { success: true, data: result.rows[0], message: 'Department updated successfully.' };
  } catch (err) {
    logger.error('departmentService.validateAndUpdate', { error: err.message, agencyDatabase, id });
    return { success: false, error: 'SERVER_ERROR', message: err.message || 'Failed to update department.' };
  } finally {
    if (client) client.release();
  }
}

/**
 * Soft delete (set is_active = false) or hard delete
 * @param {string} id - department id
 * @param {boolean} hard - if true, permanently delete (and SET NULL team_assignments.department_id)
 * @param {string} agencyDatabase - agency database name
 * @returns {Promise<{success: boolean, data?: Object, error?: string, message?: string}>}
 */
async function deleteDepartment(id, hard, agencyDatabase) {
  const pool = getAgencyPool(agencyDatabase);
  let client;
  try {
    client = await pool.connect();
    const existing = await client.query(`SELECT id, is_active FROM public.departments WHERE id = $1`, [id]);
    if (existing.rows.length === 0) {
      return { success: false, error: 'NOT_FOUND', message: 'Department not found.' };
    }

    if (hard) {
      await client.query('BEGIN');
      try {
        await client.query(`UPDATE public.team_assignments SET department_id = NULL WHERE department_id = $1`, [id]);
        await client.query(`DELETE FROM public.departments WHERE id = $1`, [id]);
        await client.query('COMMIT');
        return { success: true, message: 'Department permanently deleted.' };
      } catch (e) {
        await client.query('ROLLBACK').catch(() => {});
        throw e;
      }
    } else {
      const result = await client.query(
        `UPDATE public.departments SET is_active = false, updated_at = NOW() WHERE id = $1 RETURNING *`,
        [id]
      );
      return { success: true, data: result.rows[0], message: 'Department deactivated successfully.' };
    }
  } catch (err) {
    logger.error('departmentService.deleteDepartment', { error: err.message, agencyDatabase, id });
    return { success: false, error: 'SERVER_ERROR', message: err.message || 'Failed to delete department.' };
  } finally {
    if (client) client.release();
  }
}

/**
 * List departments with manager name, parent name, and employee count (single query, no N+1)
 * @param {Object} options - { limit, offset, sortBy?, sortDir?, search?, is_active?, manager_id?, parent_department_id?, min_budget?, max_budget? }
 * @param {string} agencyDatabase - agency database name
 * @returns {Promise<{ rows: Array, total: number }>}
 */
async function listDepartments(options, agencyDatabase) {
  const pool = getAgencyPool(agencyDatabase);
  let client;
  try {
    client = await pool.connect();
    const limit = Math.min(Math.max(Number(options.limit) || 20, 1), 200);
    const offset = Math.max(Number(options.offset) || 0, 0);
    const sortBy = ['name', 'budget', 'created_at', 'employees'].includes(options.sortBy) ? options.sortBy : 'name';
    const sortDir = (options.sortDir || 'asc').toLowerCase() === 'desc' ? 'DESC' : 'ASC';
    const conditions = [];
    const params = [];
    let paramIdx = 1;

    if (options.is_active !== undefined && options.is_active !== null && options.is_active !== '') {
      const active = options.is_active === true || options.is_active === 'true';
      conditions.push(`d.is_active = $${paramIdx++}`);
      params.push(active);
    }
    if (options.manager_id) {
      conditions.push(`d.manager_id = $${paramIdx++}`);
      params.push(options.manager_id);
    }
    if (options.parent_department_id) {
      conditions.push(`d.parent_department_id = $${paramIdx++}`);
      params.push(options.parent_department_id);
    }
    if (options.min_budget != null && options.min_budget !== '') {
      conditions.push(`d.budget >= $${paramIdx++}`);
      params.push(Number(options.min_budget));
    }
    if (options.max_budget != null && options.max_budget !== '') {
      conditions.push(`d.budget <= $${paramIdx++}`);
      params.push(Number(options.max_budget));
    }
    if (options.search && String(options.search).trim()) {
      conditions.push(`(d.name ILIKE $${paramIdx} OR d.description ILIKE $${paramIdx})`);
      params.push(`%${String(options.search).trim()}%`);
      paramIdx++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const countSql = `SELECT COUNT(*)::int as total FROM public.departments d ${whereClause}`;
    const countResult = await client.query(countSql, params);
    const total = countResult.rows[0]?.total ?? 0;

    const orderCol =
      sortBy === 'budget'
        ? 'd.budget'
        : sortBy === 'created_at'
          ? 'd.created_at'
          : sortBy === 'employees'
            ? 'COALESCE(ta.cnt, 0)'
            : 'd.name';
    const listSql = `
      SELECT d.id, d.name, d.description, d.manager_id, d.parent_department_id, d.budget, d.is_active, d.agency_id, d.created_at, d.updated_at,
             p.full_name AS manager_name,
             pd.name AS parent_name,
             COALESCE(ta.cnt, 0)::int AS employee_count
      FROM public.departments d
      LEFT JOIN public.profiles p ON p.user_id = d.manager_id
      LEFT JOIN public.departments pd ON pd.id = d.parent_department_id
      LEFT JOIN (
        SELECT department_id, COUNT(*)::int AS cnt
        FROM public.team_assignments
        WHERE is_active = true
        GROUP BY department_id
      ) ta ON ta.department_id = d.id
      ${whereClause}
      ORDER BY ${orderCol} ${sortDir} NULLS LAST
      LIMIT $${paramIdx} OFFSET $${paramIdx + 1}
    `;
    params.push(limit, offset);
    const listResult = await client.query(listSql, params);
    const rows = listResult.rows.map((r) => ({
      ...r,
      manager: r.manager_name ? { full_name: r.manager_name } : null,
      parent_department: r.parent_name ? { name: r.parent_name } : null,
      _count: { team_assignments: r.employee_count },
    }));
    return { rows, total };
  } finally {
    if (client) client.release();
  }
}

/**
 * Get department stats (active count, inactive count, total budget, total employees)
 * @param {string} agencyDatabase - agency database name
 * @returns {Promise<{active: number, inactive: number, totalBudget: number, totalEmployees: number}>}
 */
async function getDepartmentStats(agencyDatabase) {
  const pool = getAgencyPool(agencyDatabase);
  let client;
  try {
    client = await pool.connect();
    const [counts, budgetEmp] = await Promise.all([
      client.query(
        `SELECT is_active, COUNT(*)::int AS cnt FROM public.departments GROUP BY is_active`
      ),
      client.query(`
        SELECT
          COALESCE(SUM(d.budget), 0)::numeric AS total_budget,
          (SELECT COUNT(*)::int FROM public.team_assignments ta WHERE ta.is_active = true) AS total_employees
        FROM public.departments d
        WHERE d.is_active = true
      `),
    ]);
    let active = 0;
    let inactive = 0;
    for (const row of counts.rows) {
      if (row.is_active) active = row.cnt;
      else inactive = row.cnt;
    }
    const totalBudget = Number(budgetEmp.rows[0]?.total_budget ?? 0);
    const totalEmployees = Number(budgetEmp.rows[0]?.total_employees ?? 0);
    return { active, inactive, totalBudget, totalEmployees };
  } finally {
    if (client) client.release();
  }
}

module.exports = {
  validateAndCreate,
  validateAndUpdate,
  deleteDepartment,
  listDepartments,
  getDepartmentStats,
  getAllDepartments,
  hasDuplicateName,
  wouldCreateCycle,
};
