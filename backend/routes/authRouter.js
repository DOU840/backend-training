const express = require('express')
const router = express.Router()
const rateLimit =require('express-rate-limit')
const {register, login, getMe}= require('../controllers/authController')
const {protect}= require('../middleware/authMiddleware')

const loginLimit = rateLimit({
    windowMs: 15 * 60 * 1000 ,
    max : 5,
    message:{
        success: false,
        error: 'trop de tentative réessayer dans 15 minute'
    }
})
router.post('/register', register)
router.post('/login',loginLimit, login)
router.get('/me',protect, getMe)

module.exports = router