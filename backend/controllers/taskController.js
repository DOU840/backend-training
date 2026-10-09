const Task = require('../models/Task')
const AppError = require('../utils/appError')
// créer un tâche

exports.createTask = async(req, res, next)=>{
   try {
    const task = await Task.create(
        {
            titre: req.body.titre,
            description : req.body.description,
            user : req.user._id
        }
    )

    res.status(201).json({
        success: true,
        data : task
    })
   } catch (err) {
    next(err)
   }

}

// recupere mon tâche

exports.getMyTasks = async(req,res, next)=>{
    try {

        const tasks = await Task.find({
            user : req.user._id
        })
        res.status(200).json({
            success: true,
            data : tasks
        })
    } catch (err) {
        next(err)
    }
}

exports.getTaskById = async (req, res, next) => {
    try {
        const task = await Task.findOne({
            _id: req.params.id,
            user: req.user._id   // ⬅️ SÉCURITÉ : seulement ses propres tâches
        })

        if (!task) {
            throw new AppError('Tâche non trouvée', 404)
        }

        res.status(200).json({
            success: true,
            data: task
        })
    } catch (err) {
        next(err)
    }
}
// modifier un tâche

exports.updateTask = async (req, res,next) => {
    try {
        const { titre, description } = req.body;

        // Liste blanche des champs modifiables
        const updateData = {};
        if (titre !== undefined) updateData.titre = titre;
        if (description !== undefined) updateData.description = description;

        const task = await Task.findOneAndUpdate(
            { _id: req.params.id, user: req.user._id }, // Filtre : ID + propriétaire
            updateData,                                  // Données à mettre à jour
            { returnDocument: 'after', runValidators: true }           // Options
        );

        // 1. Vérifier l'existence
        if (!task) {
            throw new AppError('Tâche non trouvée ou non autorisée',404)
        }

        // 2. Renvoyer la réponse (CE QUI MANQUAIT !)
        res.status(200).json({
            success: true,
            data: task
        });

    } catch (err) {
        next(err)
    }
};
// supprimer task

exports.deleteTask = async (req, res,next) => {
    try {
        const task = await Task.findOneAndDelete({
            _id: req.params.id,      // L'ID passé dans l'URL (DELETE /tasks/:id)
            user: req.user._id       // Sécurité : la tâche doit appartenir à l'utilisateur
        });

        // 1. D'abord, on vérifie si la tâche existe (et a été supprimée)
        if (!task) {
            throw new AppError('Tâche non trouvée ou non autorisée',404)
        }

        // 2. Si on arrive ici, la suppression a réussi
        res.status(200).json({
            success: true,
            data: {} // Convention REST : on renvoie un objet vide après un DELETE
        });

    } catch (err) {
        next(err)
    }
};