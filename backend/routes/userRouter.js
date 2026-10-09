const express = require('express')
const router = express.Router()

const { protect } = require('../middleware/authMiddleware')
const { authorize } = require('../middleware/roleMiddleware')
const {
    createUser,
    getUserById,
    getAllUsers,
    updateUser,
    deleteUser
} = require('../controllers/userController')

// ============================================
// ⚠️ ORDRE IMPORTANT : routes spécifiques AVANT /:id
// ============================================

// Liste tous les users → ADMIN UNIQUEMENT
router.get('/', protect, authorize('admin'), getAllUsers)

// Créer un user → ADMIN UNIQUEMENT (le register est public, c'est différent)
router.post('/', protect, authorize('admin'), createUser)

// Récupérer UN user → auth requise
router.get('/:id', protect, getUserById)

// Modifier UN user → auth + admin (ou self si tu veux)
router.put('/:id', protect, updateUser)

// Supprimer UN user → auth + admin
router.delete('/:id', protect, authorize('admin'), deleteUser)

module.exports = router
