import { getDatabase } from "./database";
import { createSchema } from "./schema";
import { seedDatabase } from "./seed";

export async function initializeDatabase() {
  const db = await getDatabase();

  await createSchema(db);
  await seedDatabase(db);

  return db;
}
