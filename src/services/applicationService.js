import { APPLICATION_STATUS, JOB_STATUS } from "../constants/appConstants";
import { getDatabase } from "../database/database";

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
    j.salary,
    j.work_type,
    j.status AS job_status,
    cat.name AS category_name,
    c.company_name,
    COALESCE(c.avatar_uri, c.logo_path) AS logo_path,
    loc.name AS location_name,
    u.full_name AS candidate_name,
    u.email AS candidate_email,
    u.phone AS candidate_phone
  FROM applications a
  JOIN jobs j ON j.id = a.job_id
  JOIN company_profiles c ON c.id = j.company_id
  LEFT JOIN categories cat ON cat.id = j.category_id
  LEFT JOIN locations loc ON loc.id = j.location_id
  JOIN users u ON u.id = a.candidate_id
`;

export async function hasApplied(candidateId, jobId) {
  const db = await getDatabase();
  const application = await db.getFirstAsync(
    "SELECT id FROM applications WHERE candidate_id = ? AND job_id = ?",
    [candidateId, jobId]
  );

  return Boolean(application);
}

export async function applyJob(candidateId, jobId, cvId, coverLetter = "") {
  const db = await getDatabase();
  const alreadyApplied = await hasApplied(candidateId, jobId);

  if (alreadyApplied) {
    throw new Error("Bạn đã ứng tuyển việc này rồi.");
  }

  const approvedJob = await db.getFirstAsync(
    "SELECT id FROM jobs WHERE id = ? AND status = ?",
    [jobId, JOB_STATUS.APPROVED]
  );

  if (!approvedJob) {
    throw new Error("Chỉ có thể ứng tuyển việc đã được duyệt.");
  }

  const cv = await db.getFirstAsync(
    "SELECT id FROM cvs WHERE id = ? AND candidate_id = ?",
    [cvId, candidateId]
  );

  if (!cv) {
    throw new Error("Không tìm thấy CV của ứng viên.");
  }

  const result = await db.runAsync(
    `
      INSERT INTO applications
        (job_id, candidate_id, cv_id, cover_letter, status)
      VALUES
        (?, ?, ?, ?, ?)
    `,
    [
      jobId,
      candidateId,
      cvId,
      coverLetter.trim(),
      APPLICATION_STATUS.SUBMITTED,
    ]
  );

  return result.lastInsertRowId;
}

export async function getApplicationsByCandidate(candidateId) {
  const db = await getDatabase();

  return db.getAllAsync(
    `
      ${applicationSelectQuery}
      WHERE a.candidate_id = ?
      ORDER BY a.created_at DESC, a.id DESC
    `,
    [candidateId]
  );
}

export async function getApplicationsByJob(jobId) {
  const db = await getDatabase();

  return db.getAllAsync(
    `
      ${applicationSelectQuery}
      WHERE a.job_id = ?
      ORDER BY a.created_at DESC, a.id DESC
    `,
    [jobId]
  );
}

export async function updateApplicationStatus(applicationId, status) {
  const allowedStatuses = Object.values(APPLICATION_STATUS);

  if (!allowedStatuses.includes(status)) {
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

export const applicationService = {
  hasApplied,
  applyJob,
  getApplicationsByCandidate,
  getApplicationsByJob,
  updateApplicationStatus,
};
