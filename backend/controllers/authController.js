const jwt = require('jsonwebtoken')
const User = require('../models/User')

const AppError = require('../utils/appError')

// GENERATION D'UN TOKEN POU UN UTILISATEUR

const generate = (user) => {
    return jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    )
}

// REGISTER-POST /auth/register

exports.register = async (req, res, next) => {
    try {

        const {nom, email, motDePasse, age, ville}=req.body
        // creer user
        const user = await User.create({nom, email, motDePasse, age, ville});
        // generation du token
        const token = generate(user)
        // RETIRER LE MOT DE PASSE
        const userSansMdp = user.toObject()
        delete userSansMdp.motDePasse
        // la reponse
        res.status(201).json({
            success: true,
            data: { userSansMdp, token }
        })
    } catch (err) {
        next(err)
}
}

// LOGIN-POST /auth/login

exports.login = async (req, res, next) => {
    try {
        // RECUPERER L'EMAIL ET MOT DE PASSE
        const { email, motDePasse } = req.body
        // verifier que les deux champ sont fourni
        if(!email || !motDePasse){
            throw new AppError('emails et motDePasse sont obligatoire', 400)
        }
        // chercher utilisatuer par email et recuperer son motDePasse
        const user = await User.findOne({email}).select('+motDePasse')
        // verifier email + motDePasse
        if(!user || !(await user.compareMotDePasse(motDePasse))){
          throw new AppError('Identifiant invalides', 401)
        }
        // generation du token
        const token = generate(user)
        //Renvoyer user sans mot de passe
        const userSansMdp = user.toObject()
        delete userSansMdp.motDePasse
        res.status(200).json({
            success: true,
            data:{userSansMdp, token}
        })
    } catch (err) {
        next(err)
    }
}

exports.getMe = async(req, res)=>{
    res.status(200).json({
        success: true,
        data: req.user
    })
}

