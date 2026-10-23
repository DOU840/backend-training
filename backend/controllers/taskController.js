const Task = require('../models/Task')
const AppError = require('../utils/appError')
const CatchAsync = require('../utils/CatchAsync')
// créer un tâche

exports.createTask = CatchAsync(async (req, res, next) => {
    const task = await Task.create(
        {
            titre: req.body.titre,
            description: req.body.description,
            user: req.user._id
        }
    )

    res.status(201).json({
        success: true,
        data: task
    })

})

// recupere mon tâche

exports.getMyTasks = CatchAsync(async (req, res, next) => {
    const tasks = await Task.find({
        user: req.user._id
    })
    res.status(200).json({
        success: true,
        data: tasks
    })
})

exports.getTaskById = CatchAsync(async (req, res, next) => {
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
})
// modifier un tâche

exports.updateTask = CatchAsync(async (req, res, next) => {
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
        throw new AppError('Tâche non trouvée ou non autorisée', 404)
    }

    // 2. Renvoyer la réponse (CE QUI MANQUAIT !)
    res.status(200).json({
        success: true,
        data: task
    });

})
// supprimer task

exports.deleteTask = CatchAsync(async (req, res, next) => {
    const task = await Task.findOneAndDelete({
        _id: req.params.id,      // L'ID passé dans l'URL (DELETE /tasks/:id)
        user: req.user._id       // Sécurité : la tâche doit appartenir à l'utilisateur
    });

    // 1. D'abord, on vérifie si la tâche existe (et a été supprimée)
    if (!task) {
        throw new AppError('Tâche non trouvée ou non autorisée', 404)
    }

    // 2. Si on arrive ici, la suppression a réussi
    res.status(200).json({
        success: true,
        data: {} // Convention REST : on renvoie un objet vide après un DELETE
    });
})