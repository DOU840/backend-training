

const AppError = require('../utils/appError')

exports.authorize = (...rolesAuthorize) => {
    return (req, res, next) => {
        // Sécurité défensive : si protect n'a pas tourné, req.user n'existe pas
        if (!req.user) {
            return next(new AppError('Non authentifié', 401))
        }

        // Vérification du rôle
        if (!rolesAuthorize.includes(req.user.role)) {
            return next(new AppError(
                "Vous n'avez pas la permission d'accéder à cette ressource",
                403
            ))
        }

        next()
    }
}
