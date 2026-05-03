import { JOB_STATUS, ROLES, USER_STATUS } from "../constants/appConstants";
import { getDatabase } from "../database/database";

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
    c.logo_path,
    c.website,
    c.company_size,
    cat.name AS category_name,
    loc.name AS location_name
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

export async function getPendingJobs() {
  const db = await getDatabase();

  return db.getAllAsync(
    `
      ${jobSelectQuery}
      WHERE j.status = ?
      ORDER BY j.created_at ASC, j.id ASC
    `,
    [JOB_STATUS.PENDING]
  );
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

export async function getUsersByRole(role) {
  const allowedRoles = [ROLES.CANDIDATE, ROLES.EMPLOYER];

  if (!allowedRoles.includes(role)) {
    throw new Error("Vai trò tài khoản không hợp lệ.");
  }

  const db = await getDatabase();

  return db.getAllAsync(
    `
      SELECT id, full_name, email, phone, role, status, created_at, updated_at
      FROM users
      WHERE role = ?
      ORDER BY created_at DESC, id DESC
    `,
    [role]
  );
}

export async function getUserById(userId) {
  const db = await getDatabase();

  return db.getFirstAsync(
    `
      SELECT id, full_name, email, phone, role, status, created_at, updated_at
      FROM users
      WHERE id = ? AND role IN (?, ?)
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

export const adminService = {
  getDashboardStats,
  getPendingJobs,
  getJobById,
  approveJob,
  rejectJob,
  getUsersByRole,
  getUserById,
  updateUserStatus,
};
