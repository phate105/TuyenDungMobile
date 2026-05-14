import { APPLICATION_STATUS, JOB_STATUS } from "../constants/appConstants";
import { getDatabase } from "../database/database";

function requireValue(value, message) {
  if (!String(value || "").trim()) {
    throw new Error(message);
  }
}

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

  return db.getFirstAsync("SELECT * FROM company_profiles WHERE user_id = ? LIMIT 1", [employerId]);
}

export async function saveCompanyProfile(employerId, data) {
  requireValue(data.companyName, "Vui lòng nhập tên công ty.");
  requireValue(data.companyField, "Vui lòng nhập lĩnh vực công ty.");
  requireValue(data.companyAddress, "Vui lòng nhập địa chỉ công ty.");

  const db = await getDatabase();

  await db.runAsync(
    `
      INSERT INTO company_profiles
        (user_id, company_name, company_field, company_address, description, updated_at)
      VALUES
        (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(user_id) DO UPDATE SET
        company_name = excluded.company_name,
        company_field = excluded.company_field,
        company_address = excluded.company_address,
        description = excluded.description,
        updated_at = CURRENT_TIMESTAMP
    `,
    [
      employerId,
      data.companyName.trim(),
      data.companyField.trim(),
      data.companyAddress.trim(),
      data.description?.trim() || "",
    ]
  );

  return getCompanyProfile(employerId);
}

async function getRequiredCompany(employerId) {
  const company = await getCompanyProfile(employerId);

  if (!company) {
    throw new Error("Vui lòng tạo hồ sơ công ty trước.");
  }

  return company;
}

export async function getEmployerDashboard(employerId) {
  const db = await getDatabase();
  const row = await db.getFirstAsync(
    `
      SELECT
        SUM(CASE WHEN j.status = ? THEN 1 ELSE 0 END) AS pending_count,
        SUM(CASE WHEN j.status = ? THEN 1 ELSE 0 END) AS approved_count,
        SUM(CASE WHEN j.status = ? THEN 1 ELSE 0 END) AS rejected_count,
        COUNT(a.id) AS application_count
      FROM jobs j
      LEFT JOIN applications a ON a.job_id = j.id
      WHERE j.employer_id = ?
    `,
    [JOB_STATUS.PENDING, JOB_STATUS.APPROVED, JOB_STATUS.REJECTED, employerId]
  );

  return {
    pendingCount: row?.pending_count || 0,
    approvedCount: row?.approved_count || 0,
    rejectedCount: row?.rejected_count || 0,
    applicationCount: row?.application_count || 0,
  };
}

export async function getJobsByEmployer(employerId) {
  const db = await getDatabase();

  return db.getAllAsync(
    `
      ${jobSelectQuery}
      WHERE j.employer_id = ?
      GROUP BY j.id
      ORDER BY j.created_at DESC, j.id DESC
    `,
    [employerId]
  );
}

export async function getJobById(employerId, jobId) {
  const db = await getDatabase();

  return db.getFirstAsync(
    `
      ${jobSelectQuery}
      WHERE j.employer_id = ? AND j.id = ?
      GROUP BY j.id
      LIMIT 1
    `,
    [employerId, jobId]
  );
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

export async function getApplicationsByJob(employerId, jobId) {
  const db = await getDatabase();

  return db.getAllAsync(
    `
      ${applicationSelectQuery}
      WHERE j.employer_id = ? AND a.job_id = ?
      ORDER BY a.created_at DESC, a.id DESC
    `,
    [employerId, jobId]
  );
}

export async function getApplicationById(employerId, applicationId) {
  const db = await getDatabase();

  return db.getFirstAsync(
    `
      ${applicationSelectQuery}
      WHERE j.employer_id = ? AND a.id = ?
      LIMIT 1
    `,
    [employerId, applicationId]
  );
}

export async function updateApplicationStatus(employerId, applicationId, status) {
  const allowedStatuses = [
    APPLICATION_STATUS.SUBMITTED,
    APPLICATION_STATUS.UNDER_REVIEW,
    APPLICATION_STATUS.SUITABLE,
    APPLICATION_STATUS.REJECTED,
  ];

  if (!allowedStatuses.includes(status)) {
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
// Hàm reset hồ sơ nhà tuyển dụng
export async function resetCompanyProfile(userId) {
  const db = await getDatabase();
  try {
    // 1. Tìm ID công ty của người dùng này
    const company = await db.getFirstAsync(
      "SELECT id FROM company_profiles WHERE user_id = ?", 
      [userId]
    );

    if (company) {
      // 2. Xóa các đơn ứng tuyển liên quan đến các công việc của công ty này (Khóa ngoại)
      await db.runAsync(
        "DELETE FROM applications WHERE job_id IN (SELECT id FROM jobs WHERE company_id = ?)",
        [company.id]
      );

      // 3. Xóa tất cả tin tuyển dụng của công ty này
      await db.runAsync("DELETE FROM jobs WHERE company_id = ?", [company.id]);

      // 4. Cuối cùng mới xóa hồ sơ công ty
      await db.runAsync("DELETE FROM company_profiles WHERE id = ?", [company.id]);
      
      return { success: true };
    }
    return { success: false, message: "Không tìm thấy hồ sơ để xóa." };
  } catch (error) {
    throw new Error("Lỗi khi reset hồ sơ: " + error.message);
  }
}

export async function getApplicationsByEmployer(employerId) {
  const db = await getDatabase();

  return db.getAllAsync(
    `
      SELECT
        a.id,
        a.job_id,
        a.candidate_id,
        a.status,
        a.created_at,
        j.title AS job_title,
        u.full_name AS candidate_name
      FROM applications a
      JOIN jobs j ON j.id = a.job_id
      JOIN users u ON u.id = a.candidate_id
      WHERE j.employer_id = ?
      ORDER BY a.created_at DESC
    `,
    [employerId]
  );
}

export const employerService = {
  getCompanyProfile,
  saveCompanyProfile,
  getEmployerDashboard,
  getJobsByEmployer,
  getJobById,
  createJob,
  updateJob,
  getApplicationsByJob,
  getApplicationById,
  updateApplicationStatus,
  resetCompanyProfile,
  getApplicationsByEmployer,
};
