const express = require('express')

const router = express.Router()
const {protect}= require('../middleware/authMiddleware')
const {authorize}= require('../middleware/roleMiddleware')
const {createUser, getUserById, getAllUsers, updateUser, deleteUser} = require('../controllers/userController')

router.post('/',createUser)
router.get('/admin',protect, authorize('admin'), getAllUsers)
router.get('/:id', getUserById)
router.put('/:id', updateUser)
router.delete('/:id', deleteUser)

module.exports = router

