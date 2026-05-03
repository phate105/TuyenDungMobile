import { getDatabase } from "../database/database";

function requireValue(value, message) {
  if (!String(value || "").trim()) {
    throw new Error(message);
  }
}

function validateEmail(email) {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || "").trim())) {
    throw new Error("Email không đúng định dạng.");
  }
}

function validatePhone(phone) {
  const cleanPhone = String(phone || "").replace(/\s+/g, "");

  if (!/^(\+84|0)\d{9,10}$/.test(cleanPhone)) {
    throw new Error("Số điện thoại phải bắt đầu bằng 0 hoặc +84 và có 10-11 chữ số.");
  }
}

function parseVietnameseDate(value, message) {
  const match = String(value || "").trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);

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

function validateOptionalDate(value, message) {
  if (!String(value || "").trim()) {
    return null;
  }

  return parseVietnameseDate(value, message);
}

function validateYear(value, message) {
  const year = Number(String(value || "").trim());
  const currentYear = new Date().getFullYear();

  if (!Number.isInteger(year) || year < 1950 || year > currentYear + 10) {
    throw new Error(message);
  }

  return year;
}

function parsePersonalInfo(cv) {
  if (!cv?.personal_info) {
    return null;
  }

  try {
    return JSON.parse(cv.personal_info);
  } catch {
    return null;
  }
}

async function getCVRow(candidateId) {
  const db = await getDatabase();

  return db.getFirstAsync("SELECT * FROM cvs WHERE candidate_id = ?", [candidateId]);
}

async function getRequiredCV(candidateId) {
  const cv = await getCVRow(candidateId);

  if (!cv) {
    throw new Error("Vui lòng nhập thông tin cá nhân trước khi thêm phần này.");
  }

  return cv;
}

export async function getCVByCandidate(candidateId) {
  const cv = await getCVRow(candidateId);

  if (!cv) {
    return null;
  }

  return {
    ...cv,
    personalInfo: parsePersonalInfo(cv),
  };
}

export async function hasCV(candidateId) {
  const cv = await getCVRow(candidateId);

  return Boolean(cv);
}

export async function savePersonalInfo(candidateId, data) {
  requireValue(data.fullName, "Vui lòng nhập họ tên.");
  requireValue(data.email, "Vui lòng nhập email.");
  requireValue(data.phone, "Vui lòng nhập số điện thoại.");
  validateEmail(data.email);
  validatePhone(data.phone);

  const birthDate = validateOptionalDate(data.birthDate, "Ngày sinh cần đúng định dạng DD/MM/YYYY.");

  if (birthDate && birthDate > new Date()) {
    throw new Error("Ngày sinh không được lớn hơn ngày hiện tại.");
  }

  const db = await getDatabase();
  const personalInfo = {
    fullName: data.fullName.trim(),
    email: data.email.trim(),
    phone: data.phone.trim(),
    desiredTitle: data.desiredTitle?.trim() || "",
    address: data.address?.trim() || "",
    birthDate: data.birthDate?.trim() || "",
    careerObjective: data.careerObjective?.trim() || "",
  };

  await db.runAsync(
    `
      INSERT INTO cvs
        (candidate_id, personal_info, summary, updated_at)
      VALUES
        (?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(candidate_id) DO UPDATE SET
        personal_info = excluded.personal_info,
        summary = excluded.summary,
        updated_at = CURRENT_TIMESTAMP
    `,
    [candidateId, JSON.stringify(personalInfo), personalInfo.careerObjective]
  );

  return getCVByCandidate(candidateId);
}

export async function saveExperience(candidateId, data) {
  requireValue(data.organization, "Vui lòng nhập tên công ty/dự án.");
  requireValue(data.title, "Vui lòng nhập vị trí/vai trò.");
  requireValue(data.startDate, "Vui lòng nhập ngày bắt đầu.");
  requireValue(data.endDate, "Vui lòng nhập ngày kết thúc.");
  requireValue(data.description, "Vui lòng nhập mô tả kinh nghiệm.");

  const db = await getDatabase();
  const cv = await getRequiredCV(candidateId);
  const startDate = parseVietnameseDate(data.startDate, "Ngày bắt đầu cần đúng định dạng DD/MM/YYYY.");
  const endDate = parseVietnameseDate(data.endDate, "Ngày kết thúc cần đúng định dạng DD/MM/YYYY.");

  if (endDate < startDate) {
    throw new Error("Ngày kết thúc không được nhỏ hơn ngày bắt đầu.");
  }

  await db.withTransactionAsync(async () => {
    await db.runAsync("DELETE FROM experiences WHERE cv_id = ?", [cv.id]);
    await db.runAsync(
      `
        INSERT INTO experiences
          (cv_id, title, organization, description, start_date, end_date, is_current)
        VALUES
          (?, ?, ?, ?, ?, ?, ?)
      `,
      [
        cv.id,
        data.title.trim(),
        data.organization.trim(),
        data.description.trim(),
        data.startDate.trim(),
        data.endDate.trim(),
        0,
      ]
    );
    await db.runAsync("UPDATE cvs SET updated_at = CURRENT_TIMESTAMP WHERE id = ?", [cv.id]);
  });
}

export async function saveEducation(candidateId, data) {
  requireValue(data.school, "Vui lòng nhập tên trường.");
  requireValue(data.major, "Vui lòng nhập ngành học.");
  requireValue(data.startYear, "Vui lòng nhập năm bắt đầu.");
  requireValue(data.endYear, "Vui lòng nhập năm kết thúc.");
  const startYear = validateYear(data.startYear, "Năm bắt đầu không hợp lệ.");
  const endYear = validateYear(data.endYear, "Năm kết thúc không hợp lệ.");

  if (endYear < startYear) {
    throw new Error("Năm kết thúc không được nhỏ hơn năm bắt đầu.");
  }

  const db = await getDatabase();
  const cv = await getRequiredCV(candidateId);

  await db.withTransactionAsync(async () => {
    await db.runAsync("DELETE FROM educations WHERE cv_id = ?", [cv.id]);
    await db.runAsync(
      `
        INSERT INTO educations
          (cv_id, school, major, degree, start_year, end_year, description)
        VALUES
          (?, ?, ?, ?, ?, ?, ?)
      `,
      [
        cv.id,
        data.school.trim(),
        data.major.trim(),
        data.degree?.trim() || "",
        data.startYear.trim(),
        data.endYear.trim(),
        data.description?.trim() || "",
      ]
    );
    await db.runAsync("UPDATE cvs SET updated_at = CURRENT_TIMESTAMP WHERE id = ?", [cv.id]);
  });
}

export async function saveSkills(candidateId, skills) {
  const db = await getDatabase();
  const cv = await getRequiredCV(candidateId);
  const cleanSkills = skills
    .map((skill) => skill.trim())
    .filter((skill, index, list) => skill && list.indexOf(skill) === index);

  await db.withTransactionAsync(async () => {
    await db.runAsync("DELETE FROM skills WHERE cv_id = ?", [cv.id]);

    for (const skill of cleanSkills) {
      await db.runAsync("INSERT INTO skills (cv_id, name) VALUES (?, ?)", [cv.id, skill]);
    }

    await db.runAsync("UPDATE cvs SET updated_at = CURRENT_TIMESTAMP WHERE id = ?", [cv.id]);
  });
}

export async function isCVCompleted(candidateId) {
  const fullCV = await getFullCV(candidateId);

  return fullCV.isCompleted;
}

export async function getFullCV(candidateId) {
  const db = await getDatabase();
  const cv = await getCVRow(candidateId);

  if (!cv) {
    return {
      cv: null,
      personalInfo: null,
      experiences: [],
      educations: [],
      skills: [],
      completedSections: {
        personalInfo: false,
        experience: false,
        education: false,
        skills: false,
      },
      isCompleted: false,
    };
  }

  const [experiences, educations, skills] = await Promise.all([
    db.getAllAsync("SELECT * FROM experiences WHERE cv_id = ? ORDER BY id DESC", [cv.id]),
    db.getAllAsync("SELECT * FROM educations WHERE cv_id = ? ORDER BY id DESC", [cv.id]),
    db.getAllAsync("SELECT * FROM skills WHERE cv_id = ? ORDER BY id ASC", [cv.id]),
  ]);
  const personalInfo = parsePersonalInfo(cv);
  const completedSections = {
    personalInfo: Boolean(
      personalInfo?.fullName &&
        personalInfo?.email &&
        personalInfo?.phone
    ),
    experience: experiences.length > 0,
    education: educations.length > 0,
    skills: skills.length > 0,
  };

  return {
    cv,
    personalInfo,
    experiences,
    educations,
    skills,
    completedSections,
    isCompleted:
      completedSections.personalInfo &&
      completedSections.experience &&
      completedSections.education,
  };
}

export const cvService = {
  getCVByCandidate,
  hasCV,
  savePersonalInfo,
  saveExperience,
  saveEducation,
  saveSkills,
  isCVCompleted,
  getFullCV,
};
