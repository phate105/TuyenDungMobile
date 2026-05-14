import { JOB_STATUS } from "../constants/appConstants";
import { getDatabase } from "../database/database";

const CANONICAL_CATEGORIES = [
  "Công nghệ thông tin",
  "Viễn thông - Hạ tầng số",
  "Ngân hàng - Tài chính",
  "Fintech - Thanh toán số",
  "Thương mại điện tử",
  "Bán lẻ - Chuỗi cửa hàng",
  "Logistics - Kho vận",
  "Sản xuất - Kỹ thuật",
  "Ô tô - Xe máy - EV",
  "Y tế - Dược phẩm",
  "Giáo dục - EdTech",
  "Marketing - Sales - Vận hành",
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
    j.created_at,
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

export async function getApprovedJobs(options) {
  const db = await getDatabase();
  const { limit, offset } = parsePaginationOptions(options);
  const limitClause = limit ? "LIMIT ? OFFSET ?" : "";
  const params = limit ? [JOB_STATUS.APPROVED, limit, offset] : [JOB_STATUS.APPROVED];
  const rows = await db.getAllAsync(
    `
      ${jobSelectQuery}
      WHERE j.status = ?
      ORDER BY j.created_at DESC, j.id DESC
      ${limitClause}
    `,
    params
  );

  return rows.map(sanitizeJobRecord);
}

export async function getApprovedJobCount() {
  const db = await getDatabase();
  const row = await db.getFirstAsync("SELECT COUNT(*) AS total FROM jobs WHERE status = ?", [JOB_STATUS.APPROVED]);
  return row?.total || 0;
}

export async function getJobById(jobId) {
  const db = await getDatabase();
  const row = await db.getFirstAsync(
    `
      ${jobSelectQuery}
      WHERE j.id = ? AND j.status = ?
      LIMIT 1
    `,
    [jobId, JOB_STATUS.APPROVED]
  );

  return row ? sanitizeJobRecord(row) : null;
}

export async function searchJobs({
  keyword,
  categoryId,
  locationId,
  salaryRange,
  workType,
  limit,
  offset = 0,
} = {}) {
  const db = await getDatabase();
  const params = [JOB_STATUS.APPROVED];
  const where = ["j.status = ?"];
  const trimmedKeyword = normalizeLookupText(keyword).toLowerCase();

  if (trimmedKeyword) {
    where.push(`
      (
        LOWER(j.title) LIKE ?
        OR LOWER(j.description) LIKE ?
        OR LOWER(j.requirements) LIKE ?
        OR LOWER(c.company_name) LIKE ?
        OR LOWER(cat.name) LIKE ?
        OR LOWER(loc.name) LIKE ?
      )
    `);
    params.push(
      `%${trimmedKeyword}%`,
      `%${trimmedKeyword}%`,
      `%${trimmedKeyword}%`,
      `%${trimmedKeyword}%`,
      `%${trimmedKeyword}%`,
      `%${trimmedKeyword}%`
    );
  }

  if (categoryId) {
    where.push("j.category_id = ?");
    params.push(categoryId);
  }

  if (locationId) {
    where.push("j.location_id = ?");
    params.push(locationId);
  }

  if (workType) {
    where.push("j.work_type = ?");
    params.push(workType);
  }

  const shouldFilterSalaryInMemory = Boolean(salaryRange && salaryRange !== "all");
  const limitClause = limit && !shouldFilterSalaryInMemory ? "LIMIT ? OFFSET ?" : "";
  const queryParams = limitClause ? [...params, limit, offset] : params;
  const rows = await db.getAllAsync(
    `
      ${jobSelectQuery}
      WHERE ${where.join(" AND ")}
      ORDER BY j.created_at DESC, j.id DESC
      ${limitClause}
    `,
    queryParams
  );

  const filteredRows = rows.map(sanitizeJobRecord).filter((job) => {
    if (shouldFilterSalaryInMemory && !matchesSalaryRange(job.salary, salaryRange)) {
      return false;
    }

    return true;
  });

  return shouldFilterSalaryInMemory && limit ? filteredRows.slice(offset, offset + limit) : filteredRows;
}

export async function getSearchJobCount({ keyword, categoryId, locationId, salaryRange, workType } = {}) {
  const shouldFilterSalaryInMemory = Boolean(salaryRange && salaryRange !== "all");

  if (shouldFilterSalaryInMemory) {
    const jobs = await searchJobs({ keyword, categoryId, locationId, salaryRange, workType });
    return jobs.length;
  }

  const db = await getDatabase();
  const params = [JOB_STATUS.APPROVED];
  const where = ["j.status = ?"];
  const trimmedKeyword = normalizeLookupText(keyword).toLowerCase();

  if (trimmedKeyword) {
    where.push(`
      (
        LOWER(j.title) LIKE ?
        OR LOWER(j.description) LIKE ?
        OR LOWER(j.requirements) LIKE ?
        OR LOWER(c.company_name) LIKE ?
        OR LOWER(cat.name) LIKE ?
        OR LOWER(loc.name) LIKE ?
      )
    `);
    params.push(
      `%${trimmedKeyword}%`,
      `%${trimmedKeyword}%`,
      `%${trimmedKeyword}%`,
      `%${trimmedKeyword}%`,
      `%${trimmedKeyword}%`,
      `%${trimmedKeyword}%`
    );
  }

  if (categoryId) {
    where.push("j.category_id = ?");
    params.push(categoryId);
  }

  if (locationId) {
    where.push("j.location_id = ?");
    params.push(locationId);
  }

  if (workType) {
    where.push("j.work_type = ?");
    params.push(workType);
  }

  const row = await db.getFirstAsync(
    `
      SELECT COUNT(*) AS total
      FROM jobs j
      JOIN company_profiles c ON c.id = j.company_id
      LEFT JOIN categories cat ON cat.id = j.category_id
      LEFT JOIN locations loc ON loc.id = j.location_id
      WHERE ${where.join(" AND ")}
    `,
    params
  );

  return row?.total || 0;
}

export async function getSearchSuggestions(keyword, limit = 8) {
  const trimmedKeyword = normalizeLookupText(keyword).toLowerCase();

  if (!trimmedKeyword) {
    return [];
  }

  const db = await getDatabase();
  const keywordLike = `%${trimmedKeyword}%`;
  const rows = await db.getAllAsync(
    `
      SELECT text, description, type
      FROM (
        SELECT
          j.title AS text,
          c.company_name AS description,
          'job' AS type,
          1 AS sort_order
        FROM jobs j
        JOIN company_profiles c ON c.id = j.company_id
        WHERE j.status = ? AND LOWER(j.title) LIKE ?

        UNION ALL

        SELECT
          c.company_name AS text,
          'Công ty tuyển dụng' AS description,
          'company' AS type,
          2 AS sort_order
        FROM jobs j
        JOIN company_profiles c ON c.id = j.company_id
        WHERE j.status = ? AND LOWER(c.company_name) LIKE ?

        UNION ALL

        SELECT
          cat.name AS text,
          'Ngành nghề' AS description,
          'category' AS type,
          3 AS sort_order
        FROM jobs j
        JOIN categories cat ON cat.id = j.category_id
        WHERE j.status = ? AND LOWER(cat.name) LIKE ?

        UNION ALL

        SELECT
          loc.name AS text,
          'Địa điểm' AS description,
          'location' AS type,
          4 AS sort_order
        FROM jobs j
        JOIN locations loc ON loc.id = j.location_id
        WHERE j.status = ? AND LOWER(loc.name) LIKE ?
      )
      GROUP BY text
      ORDER BY MIN(sort_order), text ASC
      LIMIT ?
    `,
    [
      JOB_STATUS.APPROVED,
      keywordLike,
      JOB_STATUS.APPROVED,
      keywordLike,
      JOB_STATUS.APPROVED,
      keywordLike,
      JOB_STATUS.APPROVED,
      keywordLike,
      limit,
    ]
  );

  return rows.map((row) => ({
    ...row,
    description: normalizeLookupText(row.description),
    text: normalizeLookupText(row.text),
  }));
}

export async function getLatestJobs(limit = 8) {
  return getApprovedJobs({ limit });
}

export async function getCategories() {
  const db = await getDatabase();
  const rows = await db.getAllAsync("SELECT * FROM categories ORDER BY name ASC");
  return sanitizeLookupRows(rows, CANONICAL_CATEGORIES);
}

export async function getLocations() {
  const db = await getDatabase();
  const rows = await db.getAllAsync("SELECT * FROM locations ORDER BY name ASC");
  return dedupeLookupRows(
    rows.map((row) => ({
      ...row,
      name: normalizeLookupText(row.name),
    }))
  );
}

export async function getSuggestedJobs(candidateId, limit = 6) {
  const db = await getDatabase();
  const profile = await db.getFirstAsync(
    `
      SELECT
        cp.category_id,
        cp.location_id,
        cp.interested_category,
        cp.desired_location
      FROM candidate_profiles cp
      WHERE cp.user_id = ?
      LIMIT 1
    `,
    [candidateId]
  );
  const categoryId = profile?.category_id || (await findCategoryIdByName(db, profile?.interested_category));
  const locationId = profile?.location_id || (await findLocationIdByName(db, profile?.desired_location));

  if (categoryId && locationId) {
    const jobs = await searchJobs({ categoryId, locationId });
    if (jobs.length > 0) {
      return jobs.slice(0, limit);
    }
  }

  if (categoryId) {
    const jobs = await searchJobs({ categoryId });
    if (jobs.length > 0) {
      return jobs.slice(0, limit);
    }
  }

  if (locationId) {
    const jobs = await searchJobs({ locationId });
    if (jobs.length > 0) {
      return jobs.slice(0, limit);
    }
  }

  return getLatestJobs(limit);
}

export async function saveJob(candidateId, jobId) {
  const db = await getDatabase();

  await db.runAsync(
    `
      INSERT OR IGNORE INTO saved_jobs
        (candidate_id, job_id)
      SELECT ?, j.id
      FROM jobs j
      WHERE j.id = ? AND j.status = ?
    `,
    [candidateId, jobId, JOB_STATUS.APPROVED]
  );
}

export async function unsaveJob(candidateId, jobId) {
  const db = await getDatabase();
  await db.runAsync("DELETE FROM saved_jobs WHERE candidate_id = ? AND job_id = ?", [candidateId, jobId]);
}

export async function isJobSaved(candidateId, jobId) {
  const db = await getDatabase();
  const savedJob = await db.getFirstAsync(
    "SELECT id FROM saved_jobs WHERE candidate_id = ? AND job_id = ?",
    [candidateId, jobId]
  );

  return Boolean(savedJob);
}

export async function getSavedJobs(candidateId) {
  const db = await getDatabase();
  const rows = await db.getAllAsync(
    `
      ${jobSelectQuery}
      JOIN saved_jobs sj ON sj.job_id = j.id
      WHERE sj.candidate_id = ? AND j.status = ?
      ORDER BY sj.created_at DESC
    `,
    [candidateId, JOB_STATUS.APPROVED]
  );

  return rows.map(sanitizeJobRecord);
}

async function findCategoryIdByName(db, name) {
  const keyword = normalizeLookupText(name).toLowerCase();

  if (!keyword) {
    return null;
  }

  const category = await db.getFirstAsync(
    "SELECT id FROM categories WHERE LOWER(name) LIKE ? LIMIT 1",
    [`%${keyword}%`]
  );

  return category?.id || null;
}

async function findLocationIdByName(db, name) {
  const keyword = normalizeLookupText(name).toLowerCase();

  if (!keyword) {
    return null;
  }

  const location = await db.getFirstAsync(
    "SELECT id FROM locations WHERE LOWER(name) LIKE ? LIMIT 1",
    [`%${keyword}%`]
  );

  return location?.id || null;
}

function matchesSalaryRange(salaryText, salaryRange) {
  if (!salaryRange || salaryRange === "all") {
    return true;
  }

  const numbers = String(salaryText || "")
    .match(/\d+(?:[.,]\d+)?/g)
    ?.map((value) => Number(value.replace(",", ".")));

  if (!numbers || numbers.length === 0) {
    return false;
  }

  const minSalary = Math.min(...numbers);
  const maxSalary = Math.max(...numbers);

  const ranges = {
    "10-15": { min: 10, max: 15 },
    "15+": { min: 15, max: null },
    "8-10": { min: 8, max: 10 },
    under8: { min: 0, max: 8 },
  };

  const range = ranges[salaryRange];

  if (!range) {
    return true;
  }

  if (range.max === null) {
    return maxSalary >= range.min;
  }

  return minSalary <= range.max && maxSalary >= range.min;
}

function parsePaginationOptions(options) {
  if (typeof options === "number") {
    return { limit: options, offset: 0 };
  }

  if (!options || typeof options !== "object") {
    return { limit: null, offset: 0 };
  }

  return {
    limit: Number(options.limit) > 0 ? Number(options.limit) : null,
    offset: Number(options.offset) > 0 ? Number(options.offset) : 0,
  };
}

function sanitizeLookupRows(rows, canonicalValues) {
  const mappedRows = rows.map((row) => ({
    ...row,
    name: pickCanonicalValue(normalizeLookupText(row.name), canonicalValues),
  }));

  return dedupeLookupRows(mappedRows);
}

function dedupeLookupRows(rows) {
  const seen = new Set();
  const result = [];

  for (const row of rows) {
    const key = normalizeLookupKey(row.name);

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    result.push(row);
  }

  return result;
}

function pickCanonicalValue(value, canonicalValues) {
  if (canonicalValues.includes(value)) {
    return normalizeLookupText(value);
  }

  const valueKey = normalizeLookupKey(value);
  let bestMatch = canonicalValues[0];
  let bestScore = 0;

  for (const candidate of canonicalValues) {
    const score = similarityScore(valueKey, normalizeLookupKey(candidate));

    if (score > bestScore) {
      bestScore = score;
      bestMatch = candidate;
    }
  }

  return bestScore >= 0.48 ? normalizeLookupText(bestMatch) : normalizeLookupText(value);
}

function similarityScore(left, right) {
  if (!left || !right) {
    return 0;
  }

  const distance = levenshtein(left, right);
  return 1 - distance / Math.max(left.length, right.length);
}

function levenshtein(left, right) {
  const matrix = Array.from({ length: left.length + 1 }, (_, rowIndex) =>
    Array.from({ length: right.length + 1 }, (_, columnIndex) => {
      if (rowIndex === 0) {
        return columnIndex;
      }

      if (columnIndex === 0) {
        return rowIndex;
      }

      return 0;
    })
  );

  for (let row = 1; row <= left.length; row += 1) {
    for (let column = 1; column <= right.length; column += 1) {
      const cost = left[row - 1] === right[column - 1] ? 0 : 1;
      matrix[row][column] = Math.min(
        matrix[row - 1][column] + 1,
        matrix[row][column - 1] + 1,
        matrix[row - 1][column - 1] + cost
      );
    }
  }

  return matrix[left.length][right.length];
}

function sanitizeJobRecord(job) {
  return {
    ...job,
    category_name: normalizeLookupText(job.category_name),
    company_address: normalizeLookupText(job.company_address),
    company_field: normalizeLookupText(job.company_field),
    company_name: normalizeLookupText(job.company_name),
    description: normalizeLongText(job.description),
    location_name: normalizeLookupText(job.location_name),
    reject_reason: normalizeLookupText(job.reject_reason),
    requirements: normalizeLongText(job.requirements),
    salary: normalizeLookupText(job.salary),
    title: normalizeLookupText(job.title),
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

function normalizeLookupText(value) {
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

function normalizeLookupKey(value) {
  return normalizeLookupText(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .replace(/[^a-zA-Z0-9]/g, "")
    .toLowerCase();
}

function decodeMojibake(value) {
  if (typeof value !== "string") {
    return value;
  }

  if (!/[ÃƒÃ‚Ã„Ã…Ã†Ã‡ÃÃ‘Ã’Ã“Ã”Ã•Ã–Ã˜Ã™ÃšÃ›ÃœÃÃžÃŸï¿½]|Ã¡Â»|Ã¡Âº|Ã¢â‚¬Â¢|Ã¯Â¿Â½/.test(value)) {
    return value;
  }

  try {
    return decodeURIComponent(escape(value));
  } catch (error) {
    return value;
  }
}

export async function getJobByIdForEmployer(jobId) {
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

export const jobService = {
  getApprovedJobs,
  getApprovedJobCount,
  getJobById,
  searchJobs,
  getSearchJobCount,
  getSearchSuggestions,
  getLatestJobs,
  getCategories,
  getLocations,
  getSuggestedJobs,
  saveJob,
  unsaveJob,
  isJobSaved,
  getSavedJobs,
  getJobByIdForEmployer,
};
