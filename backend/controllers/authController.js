const jwt = require('jsonwebtoken')
const User = require('../models/User')

// GENERATION D'UN TOKEN POU UN UTILISATEUR

const generate = (user) => {
    return jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    )
}

// REGISTER-POST /auth/register

exports.register = async (req, res) => {
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
        if (err.name === 'ValidationError') {
            const messages = Object.values(err.errors).map(e => e.message)
            return res.status(400).json({
                success: false,
                error: 'donnée invalide',
                details: messages

            })
        }
        if (err.code === 11000) {
            const champ = Object.keys(err.keyPattern)[0]
            return res.status(409).json({
                success: false,
                error: ` la valeur saisi dans le champ ${champ} est deja utilisé `,


            })
        }

        res.status(500).json({
            success: false,
            error: 'erreur serveur',
            details: err.message
        })
    }
}

// LOGIN-POST /auth/login

exports.login = async (req, res) => {
    try {
        // RECUPERER L'EMAIL ET MOT DE PASSE
        const { email, motDePasse } = req.body
        // verifier que les deux champ sont fourni
        if(!email || !motDePasse){
            return res.json(400).json({
                success : false,
                error: 'email et motDePasse sont obligatoire'
            })
        }
        // chercher utilisatuer par email et recuperer son motDePasse
        const user = await User.findOne({email}).select('+motDePasse')
        // verifier email + motDePasse
        if(!user || !(await user.compareMotDePasse(motDePasse))){
            return res.status(401).json({
                success: false,
                error : 'Identifiant invalide'
            })
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
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'erreur serveur',
            details: error.message
        })
    }
}

exports.getMe = async(req, res)=>{
    res.status(200).json({
        success: true,
        data: req.user
    })
}