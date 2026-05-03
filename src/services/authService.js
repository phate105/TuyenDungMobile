import AsyncStorage from "@react-native-async-storage/async-storage";

import { ROLES, SESSION_USER_ID_KEY, USER_STATUS } from "../constants/appConstants";
import { getDatabase } from "../database/database";

function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

function sanitizeUser(user) {
  if (!user) {
    return null;
  }

  const { password, ...safeUser } = user;
  return safeUser;
}

function requireValue(value, message) {
  if (!String(value || "").trim()) {
    throw new Error(message);
  }
}

async function getUserById(userId) {
  const db = await getDatabase();
  const user = await db.getFirstAsync("SELECT * FROM users WHERE id = ?", [userId]);

  return sanitizeUser(user);
}

async function getUserByEmail(email) {
  const db = await getDatabase();
  return db.getFirstAsync("SELECT * FROM users WHERE email = ?", [normalizeEmail(email)]);
}

async function assertEmailAvailable(email) {
  const existingUser = await getUserByEmail(email);

  if (existingUser) {
    throw new Error("Email đã được sử dụng.");
  }
}

async function saveSession(userId) {
  await AsyncStorage.setItem(SESSION_USER_ID_KEY, String(userId));
}

export async function getCurrentUser() {
  const userId = await AsyncStorage.getItem(SESSION_USER_ID_KEY);

  if (!userId) {
    return null;
  }

  const user = await getUserById(Number(userId));

  if (!user || user.status === USER_STATUS.LOCKED) {
    await logout();
    return null;
  }

  return user;
}

export async function login(email, password) {
  requireValue(email, "Vui lòng nhập email.");
  requireValue(password, "Vui lòng nhập mật khẩu.");

  const user = await getUserByEmail(email);

  if (!user || user.password !== password) {
    throw new Error("Email hoặc mật khẩu không đúng.");
  }

  if (user.status === USER_STATUS.LOCKED) {
    throw new Error("Tài khoản đã bị khóa.");
  }

  await saveSession(user.id);

  return sanitizeUser(user);
}

export async function registerCandidate(form) {
  requireValue(form.fullName, "Vui lòng nhập họ tên.");
  requireValue(form.email, "Vui lòng nhập email.");
  requireValue(form.password, "Vui lòng nhập mật khẩu.");
  requireValue(form.phone, "Vui lòng nhập số điện thoại.");
  requireValue(form.interestedCategory, "Vui lòng chọn ngành nghề quan tâm.");
  requireValue(form.desiredLocation, "Vui lòng chọn địa điểm.");

  await assertEmailAvailable(form.email);

  const db = await getDatabase();
  let newUserId = null;

  await db.withTransactionAsync(async () => {
    const result = await db.runAsync(
      `
        INSERT INTO users
          (full_name, email, password, phone, role, status)
        VALUES
          (?, ?, ?, ?, ?, ?)
      `,
      [
        form.fullName.trim(),
        normalizeEmail(form.email),
        form.password,
        form.phone.trim(),
        ROLES.CANDIDATE,
        USER_STATUS.ACTIVE,
      ]
    );
    newUserId = result.lastInsertRowId;

    await db.runAsync(
      `
        INSERT INTO candidate_profiles
          (user_id, interested_category, desired_location, category_id, location_id)
        VALUES
          (?, ?, ?, ?, ?)
      `,
      [
        newUserId,
        form.interestedCategory.trim(),
        form.desiredLocation.trim(),
        form.categoryId || null,
        form.locationId || null,
      ]
    );
  });

  const createdUser = await getUserById(newUserId);
  await saveSession(createdUser.id);

  return createdUser;
}

export async function registerEmployer(form) {
  requireValue(form.representativeName, "Vui lòng nhập người phụ trách tuyển dụng.");
  requireValue(form.email, "Vui lòng nhập email.");
  requireValue(form.password, "Vui lòng nhập mật khẩu.");
  requireValue(form.phone, "Vui lòng nhập số điện thoại.");
  requireValue(form.companyName, "Vui lòng nhập tên công ty.");
  requireValue(form.companyField, "Vui lòng chọn lĩnh vực hoạt động.");
  requireValue(form.companyAddress, "Vui lòng chọn địa điểm công ty.");

  await assertEmailAvailable(form.email);

  const db = await getDatabase();
  let newUserId = null;

  await db.withTransactionAsync(async () => {
    const result = await db.runAsync(
      `
        INSERT INTO users
          (full_name, email, password, phone, role, status)
        VALUES
          (?, ?, ?, ?, ?, ?)
      `,
      [
        form.representativeName.trim(),
        normalizeEmail(form.email),
        form.password,
        form.phone.trim(),
        ROLES.EMPLOYER,
        USER_STATUS.ACTIVE,
      ]
    );
    newUserId = result.lastInsertRowId;

    await db.runAsync(
      `
        INSERT INTO company_profiles
          (user_id, company_name, company_field, company_address)
        VALUES
          (?, ?, ?, ?)
      `,
      [
        newUserId,
        form.companyName.trim(),
        form.companyField.trim(),
        form.companyAddress.trim(),
      ]
    );
  });

  const createdUser = await getUserById(newUserId);
  await saveSession(createdUser.id);

  return createdUser;
}

export async function logout() {
  await AsyncStorage.removeItem(SESSION_USER_ID_KEY);
}

export const authService = {
  getCurrentUser,
  login,
  registerCandidate,
  registerEmployer,
  logout,
};
