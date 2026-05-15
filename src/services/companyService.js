import { JOB_STATUS } from "../constants/appConstants";
import { getDatabase } from "../database/database";

const companyJobSelectQuery = `
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
    j.created_at,
    c.company_name,
    c.company_field,
    c.company_address,
    COALESCE(c.avatar_uri, c.logo_path) AS logo_path,
    c.website,
    c.company_size,
    cat.name AS category_name,
    loc.name AS location_name
  FROM jobs j
  JOIN company_profiles c ON c.id = j.company_id
  LEFT JOIN categories cat ON cat.id = j.category_id
  LEFT JOIN locations loc ON loc.id = j.location_id
`;

export async function getCompanyById(companyId) {
  const db = await getDatabase();

  return db.getFirstAsync(
    `
      SELECT
        c.id,
        c.user_id,
        c.company_name,
        c.company_field,
        c.company_address,
        c.description,
        COALESCE(c.avatar_uri, c.logo_path) AS logo_path,
        c.website,
        c.company_size,
        c.contact_person,
        c.created_at,
        c.updated_at,
        COUNT(j.id) AS approved_job_count
      FROM company_profiles c
      LEFT JOIN jobs j ON j.company_id = c.id AND j.status = ?
      WHERE c.id = ?
      GROUP BY c.id
      LIMIT 1
    `,
    [JOB_STATUS.APPROVED, companyId]
  );
}

export async function getApprovedJobsByCompany(companyId) {
  const db = await getDatabase();

  return db.getAllAsync(
    `
      ${companyJobSelectQuery}
      WHERE j.company_id = ? AND j.status = ?
      ORDER BY j.created_at DESC, j.id DESC
    `,
    [companyId, JOB_STATUS.APPROVED]
  );
}

export const companyService = {
  getCompanyById,
  getApprovedJobsByCompany,
};
