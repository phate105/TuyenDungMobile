import { getDatabase } from "../database/database";

function requireValue(value, message) {
  if (!String(value || "").trim()) {
    throw new Error(message);
  }
}

function validatePhone(phone) {
  const cleanPhone = String(phone || "").replace(/\s+/g, "");

  if (cleanPhone && !/^(\+84|0)\d{9,10}$/.test(cleanPhone)) {
    throw new Error("Số điện thoại phải bắt đầu bằng 0 hoặc +84 và có 10-11 chữ số.");
  }
}

function validateOptionalDate(value, message) {
  const rawValue = String(value || "").trim();

  if (!rawValue) {
    return null;
  }

  const match = rawValue.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);

  if (!match) {
    throw new Error(message);
  }

  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);
  const date = new Date(year, month - 1, day);

  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    throw new Error(message);
  }

  return date;
}

function validateMaxLength(value, maxLength, message) {
  if (String(value || "").trim().length > maxLength) {
    throw new Error(message);
  }
}

function validateExpectedSalary(value) {
  const salary = String(value || "").trim();

  if (!salary) {
    return;
  }

  if (salary.length > 40) {
    throw new Error("Mức lương mong muốn không được vượt quá 40 ký tự.");
  }

  if (!/(\d|thoa thuan|thỏa thuận|thoả thuận)/i.test(salary)) {
    throw new Error("Mức lương mong muốn cần có số hoặc ghi 'Thỏa thuận'.");
  }
}

async function ensureCandidateProfile(db, candidateId) {
  const existingProfile = await db.getFirstAsync(
    "SELECT id FROM candidate_profiles WHERE user_id = ?",
    [candidateId]
  );

  if (existingProfile) {
    return existingProfile;
  }

  const result = await db.runAsync(
    `
      INSERT INTO candidate_profiles
        (user_id, interested_category, desired_location)
      VALUES
        (?, ?, ?)
    `,
    [candidateId, "", ""]
  );

  return { id: result.lastInsertRowId };
}

export async function getCandidateProfile(candidateId) {
  const db = await getDatabase();

  return db.getFirstAsync(
    `
      SELECT
        u.id,
        u.full_name,
        u.email,
        u.phone,
        cp.address,
        cp.birth_date,
        cp.bio,
        cp.interested_category,
        cp.desired_location,
        cp.category_id,
        cp.location_id,
        cp.desired_title,
        cp.work_type,
        cp.expected_salary,
        cp.avatar_uri,
        cat.name AS category_name,
        loc.name AS location_name
      FROM users u
      LEFT JOIN candidate_profiles cp ON cp.user_id = u.id
      LEFT JOIN categories cat ON cat.id = cp.category_id
      LEFT JOIN locations loc ON loc.id = cp.location_id
      WHERE u.id = ?
      LIMIT 1
    `,
    [candidateId]
  );
}

export async function updateCandidateProfile(candidateId, data) {
  requireValue(data.fullName, "Vui lòng nhập họ tên.");
  if (data.fullName.trim().length < 2) {
    throw new Error("Họ tên phải có ít nhất 2 ký tự.");
  }

  validatePhone(data.phone);
  const birthDate = validateOptionalDate(data.birthDate, "Ngày sinh cần đúng định dạng DD/MM/YYYY.");

  if (birthDate && birthDate > new Date()) {
    throw new Error("Ngày sinh không được lớn hơn ngày hiện tại.");
  }

  validateMaxLength(data.address, 150, "Địa chỉ không được vượt quá 150 ký tự.");
  validateMaxLength(data.bio, 500, "Giới thiệu bản thân không được vượt quá 500 ký tự.");

  const db = await getDatabase();

  await db.withTransactionAsync(async () => {
    await ensureCandidateProfile(db, candidateId);

    await db.runAsync(
      `
        UPDATE users
        SET
          full_name = ?,
          phone = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `,
      [data.fullName.trim(), data.phone?.trim() || "", candidateId]
    );

    await db.runAsync(
      `
        UPDATE candidate_profiles
        SET
          address = ?,
          birth_date = ?,
          bio = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ?
      `,
      [
        data.address?.trim() || "",
        data.birthDate?.trim() || "",
        data.bio?.trim() || "",
        candidateId,
      ]
    );
  });

  return getCandidateProfile(candidateId);
}

export async function updateJobPreference(candidateId, data) {
  const db = await getDatabase();
  const categoryId = data.categoryId ? Number(data.categoryId) : null;
  const locationId = data.locationId ? Number(data.locationId) : null;
  const allowedWorkTypes = ["full_time", "part_time", "internship", "remote", ""];

  validateMaxLength(data.desiredTitle, 80, "Vị trí mong muốn không được vượt quá 80 ký tự.");
  validateExpectedSalary(data.expectedSalary);

  if (!allowedWorkTypes.includes(data.workType || "")) {
    throw new Error("Hình thức làm việc không hợp lệ.");
  }

  const [category, location] = await Promise.all([
    categoryId
      ? db.getFirstAsync("SELECT name FROM categories WHERE id = ?", [categoryId])
      : null,
    locationId
      ? db.getFirstAsync("SELECT name FROM locations WHERE id = ?", [locationId])
      : null,
  ]);

  await db.withTransactionAsync(async () => {
    await ensureCandidateProfile(db, candidateId);

    await db.runAsync(
      `
        UPDATE candidate_profiles
        SET
          interested_category = ?,
          desired_location = ?,
          category_id = ?,
          location_id = ?,
          desired_title = ?,
          work_type = ?,
          expected_salary = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ?
      `,
      [
        category?.name || "",
        location?.name || "",
        categoryId,
        locationId,
        data.desiredTitle?.trim() || "",
        data.workType?.trim() || "",
        data.expectedSalary?.trim() || "",
        candidateId,
      ]
    );
  });

  return getCandidateProfile(candidateId);
}

export async function updateCandidateAvatar(candidateId, avatarUri) {
  const db = await getDatabase();

  await db.withTransactionAsync(async () => {
    await ensureCandidateProfile(db, candidateId);

    await db.runAsync(
      `
        UPDATE candidate_profiles
        SET
          avatar_uri = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ?
      `,
      [avatarUri || "", candidateId]
    );
  });

  return getCandidateProfile(candidateId);
}

export const candidateService = {
  getCandidateProfile,
  updateCandidateProfile,
  updateJobPreference,
  updateCandidateAvatar,
};
