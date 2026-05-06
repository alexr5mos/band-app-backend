import { pool } from '../server.js';

const initDB = async () => {
  try {
    // Users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        username VARCHAR(100) NOT NULL,
        instrument VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Songs table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS songs (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        genre VARCHAR(50),
        bpm INTEGER,
        key VARCHAR(10),
        created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Song details table (lyrics, chords, structure)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS song_details (
        id SERIAL PRIMARY KEY,
        song_id INTEGER UNIQUE REFERENCES songs(id) ON DELETE CASCADE,
        lyrics TEXT,
        chords TEXT,
        structure TEXT,
        notes TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_by INTEGER REFERENCES users(id) ON DELETE SET NULL
      );
    `);

    // Audio files table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS audio_files (
        id SERIAL PRIMARY KEY,
        song_id INTEGER REFERENCES songs(id) ON DELETE CASCADE,
        file_path VARCHAR(255) NOT NULL,
        file_name VARCHAR(255) NOT NULL,
        file_size INTEGER,
        duration_seconds INTEGER,
        uploaded_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
        uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        version_number INTEGER DEFAULT 1
      );
    `);

    // Comments table (optional, for collaboration)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS comments (
        id SERIAL PRIMARY KEY,
        song_id INTEGER REFERENCES songs(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        text TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Rehearsals table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS rehearsals (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255),
        date DATE NOT NULL,
        time TIME,
        location VARCHAR(255),
        notes TEXT,
        status VARCHAR(20) DEFAULT 'proposed',
        created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Availability table (for polling when people are free)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS availability (
        id SERIAL PRIMARY KEY,
        rehearsal_id INTEGER REFERENCES rehearsals(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        status VARCHAR(20) DEFAULT 'maybe',
        responded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(rehearsal_id, user_id)
      );
    `);

    console.log('✓ Database tables created');
    process.exit(0);
  } catch (err) {
    console.error('Database init error:', err);
    process.exit(1);
  }
};

initDB();
