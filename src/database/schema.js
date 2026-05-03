export async function createSchema(db) {
  await db.execAsync(`
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      full_name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      phone TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('admin', 'employer', 'candidate')),
      status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'locked')),
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS candidate_profiles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL UNIQUE,
      interested_category TEXT NOT NULL,
      desired_location TEXT NOT NULL,
      category_id INTEGER,
      location_id INTEGER,
      desired_title TEXT,
      work_type TEXT,
      expected_salary TEXT,
      avatar_uri TEXT,
      address TEXT,
      birth_date TEXT,
      bio TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
      FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS cvs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      candidate_id INTEGER NOT NULL UNIQUE,
      personal_info TEXT NOT NULL,
      summary TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (candidate_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS experiences (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cv_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      organization TEXT NOT NULL,
      description TEXT NOT NULL,
      start_date TEXT,
      end_date TEXT,
      is_current INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (cv_id) REFERENCES cvs(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS educations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cv_id INTEGER NOT NULL,
      school TEXT NOT NULL,
      major TEXT NOT NULL,
      degree TEXT NOT NULL,
      start_year TEXT,
      end_year TEXT,
      description TEXT,
      FOREIGN KEY (cv_id) REFERENCES cvs(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS skills (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cv_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      FOREIGN KEY (cv_id) REFERENCES cvs(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS company_profiles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL UNIQUE,
      company_name TEXT NOT NULL,
      company_field TEXT NOT NULL,
      company_address TEXT NOT NULL,
      description TEXT,
      logo_path TEXT,
      website TEXT,
      company_size TEXT,
      contact_person TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE
    );

    CREATE TABLE IF NOT EXISTS locations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE
    );

    CREATE TABLE IF NOT EXISTS jobs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      employer_id INTEGER NOT NULL,
      company_id INTEGER NOT NULL,
      category_id INTEGER,
      location_id INTEGER,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      requirements TEXT NOT NULL,
      salary TEXT,
      work_type TEXT NOT NULL DEFAULT 'Full-time',
      status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'rejected')),
      reject_reason TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (employer_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (company_id) REFERENCES company_profiles(id) ON DELETE CASCADE,
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
      FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS applications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      job_id INTEGER NOT NULL,
      candidate_id INTEGER NOT NULL,
      cv_id INTEGER NOT NULL,
      cover_letter TEXT,
      status TEXT NOT NULL DEFAULT 'submitted' CHECK(status IN ('submitted', 'viewed', 'suitable', 'rejected')),
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(job_id, candidate_id),
      FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
      FOREIGN KEY (candidate_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (cv_id) REFERENCES cvs(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS saved_jobs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      candidate_id INTEGER NOT NULL,
      job_id INTEGER NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(candidate_id, job_id),
      FOREIGN KEY (candidate_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
    );
  `);

  await addColumnIfMissing(db, "jobs", "work_type", "TEXT NOT NULL DEFAULT 'Full-time'");
  await addColumnIfMissing(db, "experiences", "is_current", "INTEGER NOT NULL DEFAULT 0");
  await addColumnIfMissing(db, "educations", "description", "TEXT");
  await addColumnIfMissing(db, "applications", "cover_letter", "TEXT");
  await addColumnIfMissing(db, "candidate_profiles", "category_id", "INTEGER");
  await addColumnIfMissing(db, "candidate_profiles", "location_id", "INTEGER");
  await addColumnIfMissing(db, "candidate_profiles", "desired_title", "TEXT");
  await addColumnIfMissing(db, "candidate_profiles", "work_type", "TEXT");
  await addColumnIfMissing(db, "candidate_profiles", "expected_salary", "TEXT");
  await addColumnIfMissing(db, "candidate_profiles", "avatar_uri", "TEXT");
  await addColumnIfMissing(db, "candidate_profiles", "address", "TEXT");
  await addColumnIfMissing(db, "candidate_profiles", "birth_date", "TEXT");
  await addColumnIfMissing(db, "candidate_profiles", "bio", "TEXT");
  await addColumnIfMissing(db, "company_profiles", "logo_path", "TEXT");
  await addColumnIfMissing(db, "company_profiles", "website", "TEXT");
  await addColumnIfMissing(db, "company_profiles", "company_size", "TEXT");
  await addColumnIfMissing(db, "company_profiles", "contact_person", "TEXT");
}

async function addColumnIfMissing(db, tableName, columnName, columnDefinition) {
  const columns = await db.getAllAsync(`PRAGMA table_info(${tableName})`);
  const hasColumn = columns.some((column) => column.name === columnName);

  if (!hasColumn) {
    await db.execAsync(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${columnDefinition};`);
  }
}
