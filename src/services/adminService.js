import { APPLICATION_STATUS, JOB_STATUS, ROLES, USER_STATUS } from "../constants/appConstants";
import { getDatabase } from "../database/database";

const ADMIN_JOB_STATUSES = [JOB_STATUS.PENDING, JOB_STATUS.APPROVED, JOB_STATUS.REJECTED];
const ADMIN_USER_ROLES = [ROLES.CANDIDATE, ROLES.EMPLOYER];
const ADMIN_APPLICATION_STATUSES = [
  APPLICATION_STATUS.SUBMITTED,
  APPLICATION_STATUS.UNDER_REVIEW,
  APPLICATION_STATUS.SUITABLE,
  APPLICATION_STATUS.REJECTED,
];

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
    c.logo_path,
    cat.name AS category_name,
    loc.name AS location_name
  FROM jobs j
  JOIN company_profiles c ON c.id = j.company_id
  LEFT JOIN categories cat ON cat.id = j.category_id
  LEFT JOIN locations loc ON loc.id = j.location_id
`;

const applicationSelectQuery = `
  SELECT
    a.id,
    a.job_id,
    a.candidate_id,
    a.cv_id,
    a.cover_letter,
    a.status,
    a.created_at AS applied_at,
    a.updated_at,
    j.title,
    j.salary,
    j.work_type,
    c.company_name,
    c.logo_path,
    cat.name AS category_name,
    loc.name AS location_name,
    u.full_name,
    u.email,
    u.phone
  FROM applications a
  JOIN jobs j ON j.id = a.job_id
  JOIN users u ON u.id = a.candidate_id
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
  const db = await getDatabase();
  const { where, params } = buildJobFilter(status);
  const pageLimit = Number(limit) > 0 ? Number(limit) : 20;
  const pageOffset = Number(offset) > 0 ? Number(offset) : 0;

  const rows = await db.getAllAsync(
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

  return rows.map(sanitizeJobRecord);
}

export async function getJobCount(status) {
  const db = await getDatabase();
  const { where, params } = buildJobFilter(status);
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
  const row = await db.getFirstAsync(
    `
      ${jobSelectQuery}
      WHERE j.id = ?
      LIMIT 1
    `,
    [jobId]
  );

  return row ? sanitizeJobRecord(row) : null;
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
  const trimmedReason = String(reason || "").trim();

  if (!trimmedReason) {
    throw new Error("Vui lòng nhập lý do từ chối.");
  }

  const db = await getDatabase();
  await db.runAsync(
    `
      UPDATE jobs
      SET status = ?, reject_reason = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `,
    [JOB_STATUS.REJECTED, trimmedReason, jobId]
  );
}

export async function getUsersByRole(role, { limit = 20, offset = 0 } = {}) {
  validateRole(role);

  const db = await getDatabase();
  const pageLimit = Number(limit) > 0 ? Number(limit) : 20;
  const pageOffset = Number(offset) > 0 ? Number(offset) : 0;
  const rows = await db.getAllAsync(
    `
      SELECT
        u.id,
        u.full_name,
        u.email,
        u.phone,
        u.role,
        u.status,
        u.created_at,
        u.updated_at,
        cp.company_name,
        cp.logo_path
      FROM users u
      LEFT JOIN company_profiles cp ON cp.user_id = u.id
      WHERE u.role = ?
      ORDER BY u.created_at DESC, u.id DESC
      LIMIT ? OFFSET ?
    `,
    [role, pageLimit, pageOffset]
  );

  return rows.map(sanitizeUserRecord);
}

export async function getUserCountByRole(role) {
  validateRole(role);

  const db = await getDatabase();
  const row = await db.getFirstAsync("SELECT COUNT(*) AS total FROM users WHERE role = ?", [role]);
  return row?.total || 0;
}

export async function getUserById(userId) {
  const db = await getDatabase();
  const row = await db.getFirstAsync(
    `
      SELECT
        u.id,
        u.full_name,
        u.email,
        u.phone,
        u.role,
        u.status,
        u.created_at,
        u.updated_at,
        cp.company_name,
        cp.logo_path
      FROM users u
      LEFT JOIN company_profiles cp ON cp.user_id = u.id
      WHERE u.id = ? AND u.role IN (?, ?)
      LIMIT 1
    `,
    [userId, ROLES.CANDIDATE, ROLES.EMPLOYER]
  );

  return row ? sanitizeUserRecord(row) : null;
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

export async function getApplications({ status, limit = 20, offset = 0 } = {}) {
  const db = await getDatabase();
  const pageLimit = Number(limit) > 0 ? Number(limit) : 20;
  const pageOffset = Number(offset) > 0 ? Number(offset) : 0;
  const { where, params } = buildApplicationFilter(status);

  const rows = await db.getAllAsync(
    `
      ${applicationSelectQuery}
      ${where}
      ORDER BY a.created_at DESC, a.id DESC
      LIMIT ? OFFSET ?
    `,
    [...params, pageLimit, pageOffset]
  );

  return rows.map(sanitizeApplicationRecord);
}

export async function getApplicationCount(status) {
  const db = await getDatabase();
  const { where, params } = buildApplicationFilter(status);
  const row = await db.getFirstAsync(
    `
      SELECT COUNT(*) AS total
      FROM applications a
      ${where}
    `,
    params
  );

  return row?.total || 0;
}

export async function getApplicationById(applicationId) {
  const db = await getDatabase();
  const row = await db.getFirstAsync(
    `
      ${applicationSelectQuery}
      WHERE a.id = ?
      LIMIT 1
    `,
    [applicationId]
  );

  return row ? sanitizeApplicationRecord(row) : null;
}

export async function updateApplicationStatus(applicationId, status) {
  if (!ADMIN_APPLICATION_STATUSES.includes(status)) {
    throw new Error("Trạng thái đơn ứng tuyển không hợp lệ.");
  }

  const db = await getDatabase();
  await db.runAsync(
    `
      UPDATE applications
      SET status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `,
    [status, applicationId]
  );
}

function buildJobFilter(status) {
  if (!status || status === "all") {
    return { where: "", params: [] };
  }

  if (!ADMIN_JOB_STATUSES.includes(status)) {
    throw new Error("Trạng thái tin tuyển dụng không hợp lệ.");
  }

  return {
    where: "WHERE j.status = ?",
    params: [status],
  };
}

function buildApplicationFilter(status) {
  if (!status || status === "all") {
    return { where: "", params: [] };
  }

  if (!ADMIN_APPLICATION_STATUSES.includes(status)) {
    throw new Error("Trạng thái đơn ứng tuyển không hợp lệ.");
  }

  return {
    where: "WHERE a.status = ?",
    params: [status],
  };
}

function validateRole(role) {
  if (!ADMIN_USER_ROLES.includes(role)) {
    throw new Error("Vai trò tài khoản không hợp lệ.");
  }
}

function sanitizeJobRecord(job) {
  return {
    ...job,
    category_name: normalizeText(job.category_name),
    company_address: normalizeText(job.company_address),
    company_field: normalizeText(job.company_field),
    company_name: normalizeText(job.company_name),
    description: normalizeLongText(job.description),
    location_name: normalizeText(job.location_name),
    reject_reason: normalizeLongText(job.reject_reason),
    requirements: normalizeLongText(job.requirements),
    salary: normalizeText(job.salary),
    title: normalizeText(job.title),
    website: normalizeText(job.website),
  };
}

function sanitizeUserRecord(user) {
  return {
    ...user,
    company_name: normalizeText(user.company_name),
    email: normalizeText(user.email),
    full_name: normalizeText(user.full_name),
    phone: normalizeText(user.phone),
  };
}

function sanitizeApplicationRecord(application) {
  return {
    ...application,
    company_name: normalizeText(application.company_name),
    cover_letter: normalizeLongText(application.cover_letter),
    email: normalizeText(application.email),
    full_name: normalizeText(application.full_name),
    location_name: normalizeText(application.location_name),
    phone: normalizeText(application.phone),
    salary: normalizeText(application.salary),
    title: normalizeText(application.title),
  };
}

function normalizeLongText(value) {
  if (typeof value !== "string") {
    return value || "";
  }

  let result = value.trim();

  for (let index = 0; index < 3; index += 1) {
    const next = decodeMojibake(result);

    if (next === result) {
      break;
    }

    result = next;
  }

  return result
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n[ \t]+/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function normalizeText(value) {
  if (typeof value !== "string") {
    return value || "";
  }

  let result = value.trim();

  for (let index = 0; index < 3; index += 1) {
    const next = decodeMojibake(result);

    if (next === result) {
      break;
    }

    result = next;
  }

  return result.replace(/\s+/g, " ").trim();
}

function decodeMojibake(value) {
  if (typeof value !== "string") {
    return value;
  }

  if (!/[ÃÆÄÅÇÐÑÒÓÔÕÖØÙÚÛÜÝÞß]|á»|áº|â€¢|�/.test(value)) {
    return value;
  }

  try {
    return decodeURIComponent(escape(value));
  } catch (error) {
    return value;
  }
}

export const adminService = {
  approveJob,
  getApplicationById,
  getApplicationCount,
  getApplications,
  getDashboardStats,
  getJobById,
  getJobCount,
  getJobs,
  getPendingJobs,
  getUserById,
  getUserCountByRole,
  getUsersByRole,
  rejectJob,
  updateApplicationStatus,
  updateUserStatus,
};
