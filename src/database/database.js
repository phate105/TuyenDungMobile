import { openDatabaseAsync } from "expo-sqlite";

const DATABASE_NAME = "vietjob_mobile.db";

let databasePromise = null;

export function getDatabase() {
  if (!databasePromise) {
    databasePromise = openDatabaseAsync(DATABASE_NAME).catch((error) => {
      databasePromise = null;
      throw new Error(
        `Không thể mở cơ sở dữ liệu SQLite. Hãy đảm bảo đang chạy bằng Expo Go SDK 54 và đã khởi động lại với cache sạch. Chi tiết: ${error.message}`
      );
    });
  }

  return databasePromise;
}
