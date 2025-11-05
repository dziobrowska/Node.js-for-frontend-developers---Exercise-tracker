const userModel = require('../models/user');

// POST api/users
async function postUser(req, res) {
  const { username } = req.body;

  if (!username) {
    return res.status(400).json({ error: 'Username is required' });
  }

  try {
    const newUser = await userModel.createUser(username);
    res.json(newUser);
  } catch (error) {
    if (error.message === 'Username already taken') {
      return res.status(409).json({ error: error.message });
    }
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Database error creating user' });
  }
}

// POST api/users/:_id/exercises
async function postExercise(req, res) {
  const userId = req.params.user_id;
  let { description, duration, date } = req.body;

  if (!description || !duration) {
    return res.status(400).json({ error: 'Description and duration are required' });
  }

  duration = parseInt(duration);
  if (isNaN(duration) || duration <= 0) {
    return res.status(400).json({ error: 'Duration must be a positive number' });
  }

  if (!date) {
    date = new Date().toISOString().substring(0, 10);
  } else {
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
    }

    date = parsedDate.toISOString().substring(0, 10); 
  }

  try {
    const exerciseLog = await userModel.addExercise(userId, description, duration, date);

    if (!exerciseLog) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(exerciseLog); 

  } catch (error) {
    console.error('Error adding exercise:', error);
    res.status(500).json({ error: 'Database error adding exercise' });
  }
}


// GET api/users
async function getUsers(req, res) {
    try {
        const users = await userModel.getAllUsers();
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Database error fetching users' });
    }
}


// GET api/users/:_id/logs
async function getUserLogs(req, res) {
    const userId = req.params.user_id;
    const { from, to, limit } = req.query;

    try {
        const logData = await userModel.getUserLog(userId, from, to, limit);

        if (!logData) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(logData);

    } catch (error) {
        console.error('Error fetching user logs:', error);
        res.status(500).json({ error: 'Database error fetching user logs' });
    }
}


module.exports = {
  postUser,
  postExercise,
  getUsers,
  getUserLogs
};