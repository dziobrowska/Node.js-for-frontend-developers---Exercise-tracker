const { getDatabase } = require('../db');
const { v4: uuidv4 } = require('uuid');

/**
 * Creates a new user in the database.
 * @param {string} username - The name of the user to create.
 * @returns {Promise<Object>} The new user object {_id, username}.
 */
async function createUser(username) {
  const db = getDatabase();

  const _id = uuidv4().replace(/-/g, '').substring(0, 24);
  
  await db.exec('BEGIN TRANSACTION;');
  
  try {
    await db.run(
      'INSERT INTO users (_id, username) VALUES (?, ?)',
      [_id, username]
    );

    const user = await db.get(
      'SELECT _id, username FROM users WHERE _id = ?', 
      [_id]
    );
    
    await db.exec('COMMIT;');
    return user;

  } catch (error) {
    await db.exec('ROLLBACK;');
    if (error.errno === 19) {
      throw new Error('Username already taken');
    }
    throw error;
  }
}

/**
 * Adds a new exercise log for a user.
 * @param {string} userId - The ID of the user.
 * @param {string} description - Description of the exercise.
 * @param {number} duration - Duration in minutes.
 * @param {string} date - Date in 'YYYY-MM-DD' format.
 * @returns {Promise<Object>} The exercise log object.
 */
async function addExercise(userId, description, duration, date) {
  const db = getDatabase();

  // Check if the user exists first
  const user = await db.get('SELECT _id, username FROM users WHERE _id = ?', [userId]);
  if (!user) {
    return null;
  }

  // Insert the exercise
  await db.run(
    'INSERT INTO exercises (user_id, description, duration, date) VALUES (?, ?, ?, ?)',
    [userId, description, duration, date]
  );

  return {
    _id: user._id,
    username: user.username,
    date: new Date(date).toDateString(),
    duration: parseInt(duration),
    description: description,
  };
}

/**
 * Retrieves all users from the database.
 * @returns {Promise<Array<Object>>} List of all users.
 */
async function getAllUsers() {
  const db = getDatabase();
  return db.all('SELECT _id, username FROM users');
}


/**
 * Retrieves the exercise log for a specific user.
 * @param {string} userId - The ID of the user.
 * @param {string} [from] - Start date filter (YYYY-MM-DD).
 * @param {string} [to] - End date filter (YYYY-MM-DD).
 * @param {number} [limit] - Max number of logs to return.
 * @returns {Promise<Object>} User object with exercise log details.
 */
async function getUserLog(userId, from, to, limit) {
    const db = getDatabase();

    // Get the user
    const user = await db.get('SELECT _id, username FROM users WHERE _id = ?', [userId]);
    if (!user) {
        return null;
    }

    // Build the WHERE clause for filtering
    let sql = 'SELECT description, duration, date FROM exercises WHERE user_id = ?';
    const params = [userId];

    if (from) {
        sql += ' AND date >= ?';
        params.push(from);
    }
    if (to) {
        sql += ' AND date <= ?';
        params.push(to);
    }

    sql += ' ORDER BY date ASC';

    if (limit) {
        sql += ' LIMIT ?';
        params.push(limit);
    }

    // Fetch the exercises
    const exercises = await db.all(sql, params);

    // Format the log entries
    const log = exercises.map(exercise => ({
        description: exercise.description,
        duration: exercise.duration,
        date: new Date(exercise.date).toDateString()
    }));

    return {
        _id: user._id,
        username: user.username,
        count: log.length,
        log: log
    };
}


module.exports = {
  createUser,
  addExercise,
  getAllUsers,
  getUserLog
};