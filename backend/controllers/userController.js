const User = require("../models/User")
const AppError = require('../utils/appError')
// CREATE USER

exports.createUser = async (req, res,next) => {
    try {
        const user = await User.create(req.body)
        const userSansMdp = user.toObject()
        delete userSansMdp.motDePasse
        res.status(201).json({
            success: true,
            data: user
        })
    } catch (err) {
        next(err)
    }

}

// AFFICHER TOUT LES UTILISATEURS 

exports.getAllUsers = async (req, res,next) => {
    try {
        const users = await User.find()
        res.status(200).json({
            success: true,
            utilisateurs: users
        })
    } catch (err) {
        next(err)
    }
}

// RECUPERER UN UTILISATEUR

exports.getUserById = async (req, res,next) => {
    try {
        const user = await User.findById(req.params.id)
        if(!user){
            throw new AppError('Données introuvables',404)
        }
        res.status(200).json({
            success: true,
            data: user

        })
    } catch (err) {
        next(err)
    }
}

// MODIFIER UN UTILISATEUR

exports.updateUser = async (req, res,next) => {
    try {
        const newUser = await User.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!newUser) {
            throw new AppError('donnée introuvable', 400)
        }

        res.status(200).json({
            success: true,
            data: newUser
        });
    } catch (err) {
        next(err)
    }
};

// SUPPRIMER UN USER

exports.deleteUser = async(req,res, next)=>{
    try {
        const user = await User.findByIdAndDelete(req.params.id)
        if(!user){
            throw new AppError('données introuvables')
        }
        res.status(200).json({
            success : true,
            message : 'user supprimé'
        })
    } catch (err) {
        next(err)
    }
}

