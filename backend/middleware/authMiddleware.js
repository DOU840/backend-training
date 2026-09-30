const jwt = require('jsonwebtoken')
const User = require('../models/User')

exports.protect = async(req,res, next)=>{
    try {
        let token
        if(req.headers.authorization && req.headers.authorization.startsWith('Bearer ')){
           token = req.headers.authorization.split(' ')[1]
        }
        if(!token){
            return res.status(401).json({
                success: false,
                error : "Non authorizer , token manquant"
            })
        }

        // verication la signature + expiration token
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        // RECUPERER UTILISATEUR
        const user = await User.findById(decoded.id)
        // verifier l' existance de user
        if(!user){
            return res.status(401).json({
                success: false,
                error: 'donnée invalide'
            })
        }

        // ATTACHER LE USER A AL REQUETE POUR LES ROUTES SUIVANTES

        req.user = user

        next()
    } catch (error) {
        if(error.name === 'JsonWebTokenError'){
            return res.status(401).json({
                success: false,
                error:'token invalide'
            })
        }
        if(error.name === 'TokenExpiredError'){
            return res.status(401).json({
                success: false,
                error:'token expiré'
            })
        }
        res.status(500).json({
            success : falses,
            error: 'serveur error'
        })
    }


}
