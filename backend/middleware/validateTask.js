// middleware/validateTask.js
const AppError = require('../utils/appError')

exports.validateTask = (req, res, next) => {
  const { titre, description } = req.body

  // 1. Vérifier que le titre est présent et n'est pas vide
  if (!titre || titre.trim() === '') {
    // On utilise next() pour envoyer l'erreur à ton errorHandler global
    return next(new AppError('Le titre de la tâche est obligatoire.', 400))
  }

  // 2. Vérifier que le titre n'est pas trop long
  if (titre.length > 100) {
    return next(new AppError('Le titre ne doit pas dépasser 100 caractères.', 400))
  }

  // 3. (Optionnel) Vérifier le type de la description
  if (description && typeof description !== 'string') {
    return next(new AppError('La description doit être une chaîne de caractères.', 400))
  }

  // Si tout est OK, on passe au controller !
  next()
}