const express = require('express')

const router = express.Router()

const {protect} = require('../middleware/authMiddleware')
const {createTask, getMyTasks, updateTask, deleteTask}= require('../controllers/taskController')

router.get('/',protect, getMyTasks)
router.post('/',protect, createTask)
router.put('/:id',protect, updateTask)
router.delete('/:id',protect, deleteTask)

module.exports = router