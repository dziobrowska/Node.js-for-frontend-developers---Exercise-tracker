const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// GET all users - path: api/users
router.get('/', userController.getUsers);

// POST create new user - path: api/users
router.post('/', userController.postUser);

// POST add exercise - path: api/users/:_id/exercises
router.post('/:user_id/exercises', userController.postExercise);

// GET user log - path: api/users/:_id/logs
router.get('/:user_id/logs', userController.getUserLogs);


module.exports = router;
