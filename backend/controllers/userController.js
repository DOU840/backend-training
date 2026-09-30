const User = require("../models/User")

// CREATE USER

exports.createUser = async (req, res) => {
    try {
        const user = await User.create(req.body)
        const userSansMdp = user.toObject()
        delete userSansMdp.motDePasse
        res.status(201).json({
            success: true,
            data: user
        })
    } catch (err) {
        if (err.name === 'validationError') {
            const message = Object.values(err.errors).map(e => e.message)
            return res.status(400).json({
                success: false,
                error: 'donnée invalide',
                datails: message
            })
        }

        if (err.code === 11000) {
            const champ = Object.keys(err.keyPattern)[0]
            return res.status(409).json({
                success: false,
                error: `La valeur du ${champ} est deja utilisé`
            })
        }

        res.status(500).json({
            success: false,
            error: 'erreur serveur',
            details: err.message
        })
    }

}

// AFFICHER TOUT LES UTILISATEURS 

exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find()
        res.status(200).json({
            success: true,
            utilisateurs: users
        })
    } catch (err) {
        res.status(500).json({
            success: false,
            error: 'erreur serveur',
            details: err.message
        })
    }
}

// RECUPERER UN UTILISATEUR

exports.getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
        if(!user){
            return res.status(404).json({
                error: 'donnée introuvable'
            })
        }
        res.status(200).json({
            success: true,
            data: user

        })
    } catch (err) {
        if(err.name === 'castError'){
            return res.status(400).json({
                success: false,
                error: "identifiant invalide"
            })
        }

        res.status(500).json({
            success: false,
            error: 'erreur serveur',
            details: err.message
        })
    }
}

// MODIFIER UN UTILISATEUR

exports.updateUser = async (req, res) => {
    try {
        const newUser = await User.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!newUser) {
            return res.status(404).json({
                success: false,
                error: 'User introuvable'
            });
        }

        res.status(200).json({
            success: true,
            data: newUser
        });
    } catch (err) {
        if (err.name === 'ValidationError') {
            const messages = Object.values(err.errors).map(e => e.message);
            return res.status(400).json({
                success: false,
                error: 'Données invalides',
                details: messages
            });
        }

        if (err.code === 11000) {
            const champ = Object.keys(err.keyPattern)[0];
            return res.status(409).json({
                success: false,
                error: `La valeur du champ "${champ}" est déjà utilisée`
            });
        }

        if (err.name === 'CastError') {
            return res.status(400).json({
                success: false,
                error: 'Identifiant invalide'
            });
        }

        res.status(500).json({
            success: false,
            error: 'Erreur serveur',
            details: err.message
        });
    }
};

// SUPPRIMER UN USER

exports.deleteUser = async(req,res)=>{
    try {
        const user = await User.findByIdAndDelete(req.params.id)
        if(!user){
            return res.status(404).json(
                {
                    success: false,
                    error: 'user introuvable'
                }
            )
        }
        res.status(200).json({
            success : true,
            message : 'user supprimé'
        })
    } catch (err) {
        if(err.name === 'castError'){
            return res.status(400).json({
                success: false,
                error : 'donnée introuvale'
            })
        }
    }
}

