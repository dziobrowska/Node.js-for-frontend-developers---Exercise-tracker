const sqlite = require('sqlite-async');

const { Database } = sqlite;
const DB_PATH = process.env.NODE_ENV === 'test' ? ':memory:' : 'exercise-tracker.db';

let db;

/**
 * Initializes the database connection and creates the users table if it doesn't exist.
 * @returns {Promise<sqlite.Database>} The connected database instance.
 */
async function initializeDatabase() {
  try {
    db = await Database.open(DB_PATH);
    console.log(`Database connected successfully at: ${DB_PATH}`);

    await db.run(`
      CREATE TABLE IF NOT EXISTS users (
        _id TEXT PRIMARY KEY,
        username TEXT NOT NULL UNIQUE
      );
    `);
    
    await db.run(`
      CREATE TABLE IF NOT EXISTS exercises (
        _id INTEGER PRIMARY KEY,
        user_id TEXT NOT NULL,
        description TEXT NOT NULL,
        duration INTEGER NOT NULL,
        date TEXT,
        FOREIGN KEY(user_id) REFERENCES users(_id)
      );
    `);

    console.log("Tables (users, exercises) created.");
    return db;

  } catch (error) {
    console.error("Error initializing the database:", error.message);
    process.exit(1); 
  }
}

function getDatabase() {
    if (!db) {
        throw new Error("Database not initialized.");
    }
    return db;
}

initializeDatabase();

module.exports = {
  getDatabase
};