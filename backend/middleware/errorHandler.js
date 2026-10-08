

// Middleware de gestion d'erreur centralisée
// Droit etre brancher en dernier dans server.js(apres les routes)



const errorHandler = (err, req, res, next)=>{
    let error = {...err }
    error.message = err.message

    //log de l'erreur dans la console (uile en dev)

    if(process.env.NODE_ENV === 'development'){
        console.log('Erreur',err)
    }
    

    //=====================================
    //1 Erreur de validation mongoose
    //=====================================

    if(err.name=== 'ValidationError'){
        const messages = Object.values(err.errors).map(e => e.message)
        return res.status(400).json({
            success: false,
            error: 'Données invalides',
            details: messages
        })
    }
    //=====================================
    //2 Duplication(index unique violé)
    //=====================================

    if(err.code=== 11000){
        const champ= Object.keys(err.keyValue)[0]
        return res.status(409).json({
            success: false,
            error: `La valeur du ${champ} existe dejà`
            
        })
    }
    //=====================================
    //3 ID mal former
    //=====================================

    if(err.name=== 'CastError'){
        return res.status(400).json({
            success: false,
            error: 'Identifiants invalides'
            
        })
    }

    //=====================================
    //3 Erreur Token Manquant
    //=====================================

    if(err.name==='JsonWebTokenError'){
        return res.status(401).json({
            success: false,
            error:'Token invalide'
        })
    }
    if(err.name==='TokenExpiredError'){
        return res.status(401).json({
            success: false,
            error:'Token expiré, veillez vous reconnecter'
        })
    }

    //========================================
    //5 Erreur personnalisé ou Erreur inconnue
    //========================================
    const statusCode = error.statusCode || 500
const message = error.message || 'Erreur serveur'

const body = {
    success: false,
    error: message
}

if (process.env.NODE_ENV === 'development') {
    body.stack = err.stack
}

res.status(statusCode).json(body)
    
}

module.exports = errorHandler