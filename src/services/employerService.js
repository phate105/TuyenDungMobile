import { APPLICATION_STATUS, JOB_STATUS } from "../constants/appConstants";
import { getDatabase } from "../database/database";

function requireValue(value, message) {
  if (!String(value || "").trim()) {
    throw new Error(message);
  }
}

const EMPLOYER_APPLICATION_STATUSES = [
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
    c.logo_path,
    c.website,
    c.company_size,
    cat.name AS category_name,
    loc.name AS location_name,
    COUNT(a.id) AS application_count
  FROM jobs j
  JOIN company_profiles c ON c.id = j.company_id
  LEFT JOIN categories cat ON cat.id = j.category_id
  LEFT JOIN locations loc ON loc.id = j.location_id
  LEFT JOIN applications a ON a.job_id = j.id
`;

const applicationSelectQuery = `
  SELECT
    a.id,
    a.job_id,
    a.candidate_id,
    a.cv_id,
    a.cover_letter,
    a.status,
    a.created_at,
    a.updated_at,
    j.title AS job_title,
    u.full_name AS candidate_name,
    u.email AS candidate_email,
    u.phone AS candidate_phone
  FROM applications a
  JOIN jobs j ON j.id = a.job_id
  JOIN users u ON u.id = a.candidate_id
`;

export async function getCompanyProfile(employerId) {
  const db = await getDatabase();
  const row = await db.getFirstAsync("SELECT * FROM company_profiles WHERE user_id = ? LIMIT 1", [employerId]);
  return row ? sanitizeCompanyProfile(row) : null;
}

export async function saveCompanyProfile(employerId, data) {
  requireValue(data.companyName, "Vui lòng nhập tên công ty.");
  requireValue(data.companyField, "Vui lòng nhập lĩnh vực công ty.");
  requireValue(data.companyAddress, "Vui lòng nhập địa chỉ công ty.");

  const db = await getDatabase();

  await db.runAsync(
    `
      INSERT INTO company_profiles
        (
          user_id,
          company_name,
          company_field,
          company_address,
          description,
          website,
          company_size,
          contact_person,
          updated_at
        )
      VALUES
        (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(user_id) DO UPDATE SET
        company_name = excluded.company_name,
        company_field = excluded.company_field,
        company_address = excluded.company_address,
        description = excluded.description,
        website = excluded.website,
        company_size = excluded.company_size,
        contact_person = excluded.contact_person,
        updated_at = CURRENT_TIMESTAMP
    `,
    [
      employerId,
      data.companyName.trim(),
      data.companyField.trim(),
      data.companyAddress.trim(),
      data.description?.trim() || "",
      data.website?.trim() || "",
      data.companySize?.trim() || "",
      data.contactPerson?.trim() || "",
    ]
  );

  return getCompanyProfile(employerId);
}

export async function updateCompanyAvatar(employerId, avatarUri) {
  requireValue(avatarUri, "Vui lòng chọn ảnh đại diện.");

  const db = await getDatabase();
  const company = await db.getFirstAsync("SELECT id FROM company_profiles WHERE user_id = ? LIMIT 1", [
    employerId,
  ]);

  if (!company) {
    throw new Error("Vui lòng tạo hồ sơ công ty trước.");
  }

  await db.runAsync(
    `
      UPDATE company_profiles
      SET avatar_uri = ?, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ?
    `,
    [avatarUri, employerId]
  );

  return getCompanyProfile(employerId);
}

export async function getEmployerDashboard(employerId) {
  const db = await getDatabase();
  const row = await db.getFirstAsync(
    `
      SELECT
        (SELECT COUNT(*) FROM jobs WHERE employer_id = ? AND status = ?) AS pending_count,
        (SELECT COUNT(*) FROM jobs WHERE employer_id = ? AND status = ?) AS approved_count,
        (SELECT COUNT(*) FROM jobs WHERE employer_id = ? AND status = ?) AS rejected_count,
        (
          SELECT COUNT(*)
          FROM applications a
          JOIN jobs j ON j.id = a.job_id
          WHERE j.employer_id = ?
        ) AS application_count
    `,
    [
      employerId,
      JOB_STATUS.PENDING,
      employerId,
      JOB_STATUS.APPROVED,
      employerId,
      JOB_STATUS.REJECTED,
      employerId,
    ]
  );

  return {
    pendingCount: row?.pending_count || 0,
    approvedCount: row?.approved_count || 0,
    rejectedCount: row?.rejected_count || 0,
    applicationCount: row?.application_count || 0,
  };
}

export async function getJobsByEmployer(employerId, { status, limit = 10, offset = 0 } = {}) {
  const db = await getDatabase();
  const { where, params } = buildEmployerJobFilter(employerId, status);
  const pageLimit = Number(limit) > 0 ? Number(limit) : 10;
  const pageOffset = Number(offset) > 0 ? Number(offset) : 0;
  const rows = await db.getAllAsync(
    `
      ${jobSelectQuery}
      ${where}
      GROUP BY j.id
      ORDER BY j.created_at DESC, j.id DESC
      LIMIT ? OFFSET ?
    `,
    [...params, pageLimit, pageOffset]
  );

  return rows.map(sanitizeJobRecord);
}

export async function getJobCountByEmployer(employerId, status) {
  const db = await getDatabase();
  const { where, params } = buildEmployerJobFilter(employerId, status);
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

export async function getJobById(employerId, jobId) {
  const db = await getDatabase();
  const row = await db.getFirstAsync(
    `
      ${jobSelectQuery}
      WHERE j.employer_id = ? AND j.id = ?
      GROUP BY j.id
      LIMIT 1
    `,
    [employerId, jobId]
  );

  return row ? sanitizeJobRecord(row) : null;
}

export async function createJob(employerId, data) {
  validateJobData(data);

  const db = await getDatabase();
  const company = await getRequiredCompany(employerId);
  const result = await db.runAsync(
    `
      INSERT INTO jobs
        (employer_id, company_id, category_id, location_id, title, description, requirements, salary, work_type, status)
      VALUES
        (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      employerId,
      company.id,
      data.categoryId,
      data.locationId,
      data.title.trim(),
      data.description.trim(),
      data.requirements.trim(),
      data.salary.trim(),
      data.workType,
      JOB_STATUS.PENDING,
    ]
  );

  return result.lastInsertRowId;
}

export async function updateJob(employerId, jobId, data) {
  validateJobData(data);

  const db = await getDatabase();
  const job = await getJobById(employerId, jobId);

  if (!job) {
    throw new Error("Không tìm thấy tin tuyển dụng.");
  }

  await db.runAsync(
    `
      UPDATE jobs
      SET
        category_id = ?,
        location_id = ?,
        title = ?,
        description = ?,
        requirements = ?,
        salary = ?,
        work_type = ?,
        status = ?,
        reject_reason = NULL,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND employer_id = ?
    `,
    [
      data.categoryId,
      data.locationId,
      data.title.trim(),
      data.description.trim(),
      data.requirements.trim(),
      data.salary.trim(),
      data.workType,
      JOB_STATUS.PENDING,
      jobId,
      employerId,
    ]
  );
}

export async function deleteJob(employerId, jobId) {
  const db = await getDatabase();
  const job = await getJobById(employerId, jobId);

  if (!job) {
    throw new Error("Không tìm thấy tin tuyển dụng.");
  }

  await db.runAsync("DELETE FROM applications WHERE job_id = ?", [jobId]);
  await db.runAsync("DELETE FROM jobs WHERE id = ? AND employer_id = ?", [jobId, employerId]);
}

export async function getApplicationsByJob(employerId, jobId, { status, limit = 10, offset = 0 } = {}) {
  const db = await getDatabase();
  const { where, params } = buildEmployerApplicationsByJobFilter(employerId, jobId, status);
  const pageLimit = Number(limit) > 0 ? Number(limit) : 10;
  const pageOffset = Number(offset) > 0 ? Number(offset) : 0;
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

export async function getApplicationCountByJob(employerId, jobId, status) {
  const db = await getDatabase();
  const { where, params } = buildEmployerApplicationsByJobFilter(employerId, jobId, status);
  const row = await db.getFirstAsync(
    `
      SELECT COUNT(*) AS total
      FROM applications a
      JOIN jobs j ON j.id = a.job_id
      ${where}
    `,
    params
  );

  return row?.total || 0;
}

export async function getApplicationById(employerId, applicationId) {
  const db = await getDatabase();
  const row = await db.getFirstAsync(
    `
      ${applicationSelectQuery}
      WHERE j.employer_id = ? AND a.id = ?
      LIMIT 1
    `,
    [employerId, applicationId]
  );

  return row ? sanitizeApplicationRecord(row) : null;
}

export async function updateApplicationStatus(employerId, applicationId, status) {
  if (!EMPLOYER_APPLICATION_STATUSES.includes(status)) {
    throw new Error("Trạng thái đơn ứng tuyển không hợp lệ.");
  }

  const application = await getApplicationById(employerId, applicationId);

  if (!application) {
    throw new Error("Không tìm thấy đơn ứng tuyển.");
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

export async function getApplicationsByEmployer(employerId, { status, limit = 10, offset = 0 } = {}) {
  const db = await getDatabase();
  const { where, params } = buildEmployerApplicationFilter(employerId, status);
  const pageLimit = Number(limit) > 0 ? Number(limit) : 10;
  const pageOffset = Number(offset) > 0 ? Number(offset) : 0;
  const rows = await db.getAllAsync(
    `
      SELECT
        a.id,
        a.job_id,
        a.candidate_id,
        a.status,
        a.created_at,
        j.title AS job_title,
        u.full_name AS candidate_name,
        u.email AS candidate_email,
        u.phone AS candidate_phone
      FROM applications a
      JOIN jobs j ON j.id = a.job_id
      JOIN users u ON u.id = a.candidate_id
      ${where}
      ORDER BY a.created_at DESC, a.id DESC
      LIMIT ? OFFSET ?
    `,
    [...params, pageLimit, pageOffset]
  );

  return rows.map((row) => ({
    ...row,
    candidate_name: normalizeText(row.candidate_name),
    candidate_email: normalizeText(row.candidate_email),
    candidate_phone: normalizeText(row.candidate_phone),
    job_title: normalizeText(row.job_title),
  }));
}

export async function getApplicationCountByEmployer(employerId, status) {
  const db = await getDatabase();
  const { where, params } = buildEmployerApplicationFilter(employerId, status);
  const row = await db.getFirstAsync(
    `
      SELECT COUNT(*) AS total
      FROM applications a
      JOIN jobs j ON j.id = a.job_id
      ${where}
    `,
    params
  );

  return row?.total || 0;
}

async function getRequiredCompany(employerId) {
  const company = await getCompanyProfile(employerId);

  if (!company) {
    throw new Error("Vui lòng tạo hồ sơ công ty trước.");
  }

  return company;
}

function validateJobData(data) {
  requireValue(data.title, "Vui lòng nhập tên công việc.");
  requireValue(data.description, "Vui lòng nhập mô tả công việc.");
  requireValue(data.requirements, "Vui lòng nhập yêu cầu công việc.");
  requireValue(data.salary, "Vui lòng nhập mức lương.");
  requireValue(data.workType, "Vui lòng chọn hình thức làm việc.");

  if (!data.categoryId) {
    throw new Error("Vui lòng chọn ngành nghề.");
  }

  if (!data.locationId) {
    throw new Error("Vui lòng chọn địa điểm.");
  }
}

function buildEmployerJobFilter(employerId, status) {
  const where = ["WHERE j.employer_id = ?"];
  const params = [employerId];

  if (status && status !== "all") {
    where.push("AND j.status = ?");
    params.push(status);
  }

  return { where: where.join(" "), params };
}

function buildEmployerApplicationFilter(employerId, status) {
  const where = ["WHERE j.employer_id = ?"];
  const params = [employerId];

  if (status && status !== "all") {
    where.push("AND a.status = ?");
    params.push(status);
  }

  return { where: where.join(" "), params };
}

function buildEmployerApplicationsByJobFilter(employerId, jobId, status) {
  const where = ["WHERE j.employer_id = ? AND a.job_id = ?"];
  const params = [employerId, jobId];

  if (status && status !== "all") {
    where.push("AND a.status = ?");
    params.push(status);
  }

  return { where: where.join(" "), params };
}

function sanitizeCompanyProfile(profile) {
  return {
    ...profile,
    avatar_uri: normalizeText(profile.avatar_uri),
    company_address: normalizeText(profile.company_address),
    company_field: normalizeText(profile.company_field),
    company_name: normalizeText(profile.company_name),
    description: normalizeLongText(profile.description),
    company_size: normalizeText(profile.company_size),
    contact_person: normalizeText(profile.contact_person),
    logo_path: normalizeText(profile.logo_path),
    website: normalizeText(profile.website),
  };
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
  };
}

function sanitizeApplicationRecord(application) {
  return {
    ...application,
    candidate_email: normalizeText(application.candidate_email),
    candidate_name: normalizeText(application.candidate_name),
    candidate_phone: normalizeText(application.candidate_phone),
    cover_letter: normalizeLongText(application.cover_letter),
    job_title: normalizeText(application.job_title),
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

  return result
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n[ \t]+/g, "\n")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
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

export const employerService = {
  createJob,
  deleteJob,
  getApplicationById,
  getApplicationCountByEmployer,
  getApplicationCountByJob,
  getApplicationsByEmployer,
  getApplicationsByJob,
  getCompanyProfile,
  getEmployerDashboard,
  getJobById,
  getJobCountByEmployer,
  getJobsByEmployer,
  saveCompanyProfile,
  updateCompanyAvatar,
  updateApplicationStatus,
  updateJob,
};
