import { JOB_STATUS, ROLES, USER_STATUS } from "../constants/appConstants";
import { getDatabase } from "../database/database";

const ADMIN_JOB_STATUSES = [JOB_STATUS.PENDING, JOB_STATUS.APPROVED, JOB_STATUS.REJECTED];
const ADMIN_USER_ROLES = [ROLES.CANDIDATE, ROLES.EMPLOYER];

const jobSelectQuery = `
  SELECT
    j.id,
    j.employer_id,
    j.company_id,
    j.category_id,
    j.location_id,
    j.title,
    j.description,
    j.requirements,
    j.salary,
    j.work_type,
    j.status,
    j.reject_reason,
    j.created_at,
    j.updated_at,
    c.company_name,
    c.company_field,
    c.company_address,
    c.website,
    c.company_size,
    cat.name AS category_name,
    loc.name AS location_name,
    COALESCE(
      NULLIF (c.logo_path, ''),
      (SELECT logo_path FROM company_profiles 
      WHERE company_name = c.company_name 
      AND logo_path IS NOT NULL AND logo_path != ''
      LIMIT 1)
    ) AS avatar
  FROM jobs j
  JOIN company_profiles c ON c.id = j.company_id
  LEFT JOIN categories cat ON cat.id = j.category_id
  LEFT JOIN locations loc ON loc.id = j.location_id
`;

export async function getDashboardStats() {
  const db = await getDatabase();
  const userStats = await db.getFirstAsync(
    `
      SELECT
        SUM(CASE WHEN role = ? THEN 1 ELSE 0 END) AS candidate_count,
        SUM(CASE WHEN role = ? THEN 1 ELSE 0 END) AS employer_count
      FROM users
      WHERE role IN (?, ?)
    `,
    [ROLES.CANDIDATE, ROLES.EMPLOYER, ROLES.CANDIDATE, ROLES.EMPLOYER]
  );
  const jobStats = await db.getFirstAsync(
    `
      SELECT
        SUM(CASE WHEN status = ? THEN 1 ELSE 0 END) AS pending_count,
        SUM(CASE WHEN status = ? THEN 1 ELSE 0 END) AS approved_count,
        SUM(CASE WHEN status = ? THEN 1 ELSE 0 END) AS rejected_count
      FROM jobs
    `,
    [JOB_STATUS.PENDING, JOB_STATUS.APPROVED, JOB_STATUS.REJECTED]
  );
  const applicationStats = await db.getFirstAsync("SELECT COUNT(*) AS total FROM applications");

  return {
    candidateCount: userStats?.candidate_count || 0,
    employerCount: userStats?.employer_count || 0,
    pendingJobCount: jobStats?.pending_count || 0,
    approvedJobCount: jobStats?.approved_count || 0,
    rejectedJobCount: jobStats?.rejected_count || 0,
    applicationCount: applicationStats?.total || 0,
  };
}

export async function getJobs({ status, limit = 20, offset = 0 } = {}) {
  const { where, params } = buildJobFilter(status);
  const pageLimit = Number(limit) > 0 ? Number(limit) : 20;
  const pageOffset = Number(offset) > 0 ? Number(offset) : 0;
  const db = await getDatabase();

  return db.getAllAsync(
    `
      ${jobSelectQuery}
      ${where}
      ORDER BY
        CASE j.status
          WHEN '${JOB_STATUS.PENDING}' THEN 0
          WHEN '${JOB_STATUS.APPROVED}' THEN 1
          ELSE 2
        END,
        j.created_at DESC,
        j.id DESC
      LIMIT ? OFFSET ?
    `,
    [...params, pageLimit, pageOffset]
  );
}

export async function getJobCount(status) {
  const { where, params } = buildJobFilter(status);
  const db = await getDatabase();
  const row = await db.getFirstAsync(
    `
      SELECT COUNT(*) AS total
      FROM jobs j
      ${where}
    `,
    params
  );

  return row?.total || 0;
}

export async function getPendingJobs(options = {}) {
  return getJobs({ ...options, status: JOB_STATUS.PENDING });
}



export async function getJobById(jobId) {
  const db = await getDatabase();

  return db.getFirstAsync(
    `
      ${jobSelectQuery}
      WHERE j.id = ?
      LIMIT 1
    `,
    [jobId]
  );
}

export async function approveJob(jobId) {
  const db = await getDatabase();

  await db.runAsync(
    `
      UPDATE jobs
      SET status = ?, reject_reason = NULL, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `,
    [JOB_STATUS.APPROVED, jobId]
  );
}

export async function rejectJob(jobId, reason = "") {
  const db = await getDatabase();

  await db.runAsync(
    `
      UPDATE jobs
      SET status = ?, reject_reason = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `,
    [JOB_STATUS.REJECTED, reason.trim(), jobId]
  );
}

export async function getUsersByRole(role, { limit = 20, offset = 0 } = {}) {
  const db = await getDatabase();
  const pageLimit = Number(limit) > 0 ? Number(limit) : 20;
  const pageOffset = Number(offset) > 0 ? Number(offset) : 0;
  return db.getAllAsync(
    `
      SELECT 
        u.*, 
        COALESCE(
          NULLIF (cp.logo_path, ''),
          (SELECT logo_path FROM company_profiles 
           WHERE TRIM(company_name) = TRIM(cp.company_name) 
           AND logo_path IS NOT NULL 
           AND logo_path != ''
           LIMIT 1)
        ) AS avatar 
      FROM users u
      LEFT JOIN company_profiles cp ON u.id = cp.user_id
      WHERE u.role = ?
      ORDER BY u.created_at DESC
      LIMIT ? OFFSET ?
    `,
    [role, pageLimit, pageOffset]
  );
}

export async function getUserCountByRole(role) {
  validateRole(role);

  const db = await getDatabase();
  const row = await db.getFirstAsync("SELECT COUNT(*) AS total FROM users WHERE role = ?", [role]);
  return row?.total || 0;
}

export async function getUserById(userId) {
  const db = await getDatabase();

  return db.getFirstAsync(
    `
      SELECT 
        u.id, u.full_name, u.email, u.phone, u.role, u.status, u.created_at, u.updated_at,
        COALESCE(NULLIF(cp.logo_path, ''), (SELECT logo_path FROM company_profiles WHERE company_name = cp.company_name AND logo_path IS NOT NULL AND logo_path != '' LIMIT 1)) AS avatar
      FROM users u
      LEFT JOIN company_profiles cp ON u.id = cp.user_id
      WHERE u.id = ? AND u.role IN (?, ?)
      LIMIT 1
    `,
    [userId, ROLES.CANDIDATE, ROLES.EMPLOYER]
  );
}

export async function updateUserStatus(userId, status) {
  const allowedStatuses = [USER_STATUS.ACTIVE, USER_STATUS.LOCKED];

  if (!allowedStatuses.includes(status)) {
    throw new Error("Trạng thái tài khoản không hợp lệ.");
  }

  const user = await getUserById(userId);

  if (!user) {
    throw new Error("Không tìm thấy tài khoản.");
  }

  const db = await getDatabase();

  await db.runAsync(
    `
      UPDATE users
      SET status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `,
    [status, userId]
  );
}

function buildJobFilter(status) {
  if (!status || status === "all") {
    return { params: [], where: "" };
  }

  if (!ADMIN_JOB_STATUSES.includes(status)) {
    throw new Error("Trạng thái tin tuyển dụng không hợp lệ.");
  }

  return {
    params: [status],
    where: "WHERE j.status = ?",
  };
}

function validateRole(role) {
  if (!ADMIN_USER_ROLES.includes(role)) {
    throw new Error("Vai trò tài khoản không hợp lệ.");
  }
}

export async function getApplications({ status, limit = 20, offset = 0 } = {}) {
  const db = await getDatabase();
  const pageLimit = Number(limit) > 0 ? Number(limit) : 20;
  const pageOffset = Number(offset) > 0 ? Number(offset) : 0;

  // Base query lấy đầy đủ thông tin để hiển thị Card
  let query = `
    SELECT 
      a.*, 
      j.title, 
      c.company_name,
      cat.name AS category_name,
      loc.name AS location_name,
      j.salary,
      j.work_type,
      COALESCE(
        NULLIF (c.logo_path, ''),
        (SELECT logo_path 
        FROM company_profiles 
        WHERE company_name = c.company_name 
        AND logo_path IS NOT NULL AND logo_path != ''
        LIMIT 1)
      ) AS avatar
    FROM applications a
    JOIN jobs j ON a.job_id = j.id
    JOIN company_profiles c ON j.company_id = c.id
    LEFT JOIN categories cat ON cat.id = j.category_id
    LEFT JOIN locations loc ON loc.id = j.location_id
  `;

  const sqlParams = [];
  // Đồng bộ logic: nếu status là 'all' thì không lọc WHERE
  if (status && status !== "all") {
    query += ` WHERE a.status = ?`;
    sqlParams.push(status);
  }

  query += ` ORDER BY a.created_at DESC LIMIT ? OFFSET ?`;
  sqlParams.push(Number(limit), Number(offset));

  return db.getAllAsync(query, sqlParams);
}

export async function updateApplicationStatus(id, status) {
  const db = await getDatabase();
  return db.runAsync(
    "UPDATE applications SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
    [status, id]
  );
}

export async function getApplicationCount(status) {
  const db = await getDatabase();
  let query = "SELECT COUNT(*) AS total FROM applications a";
  const params = [];

  if (status && status !== "all") {
    query += " WHERE a.status = ?";
    params.push(status);
  }

  const row = await db.getFirstAsync(query, params);
  return row?.total || 0;
}

export const adminService = {
  getDashboardStats,
  getJobs,
  getJobCount,
  getPendingJobs,
  getJobById,
  approveJob,
  rejectJob,
  getUsersByRole,
  getUserCountByRole,
  getUserById,
  updateUserStatus,
  getApplications,
  getApplicationCount,
  updateApplicationStatus
};
