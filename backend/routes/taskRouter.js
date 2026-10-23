const express = require('express')

const router = express.Router()

const {protect} = require('../middleware/authMiddleware')
const {createTask, getMyTasks,getTaskById, updateTask, deleteTask}= require('../controllers/taskController')
const { validateTask } = require('../middleware/validateTask')
router.get('/',protect, getMyTasks)
router.get('/:id',protect, getTaskById)
router.post('/',protect,validateTask, createTask)
router.put('/:id',protect, updateTask)
router.delete('/:id',protect, deleteTask)

module.exports = router