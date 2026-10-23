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
    // 1. On récupère les paramètres de l'URL (avec des valeurs par défaut)
    const page = parseInt(req.query.page) || 1  // Page actuelle (défaut: 1)
    const limit = parseInt(req.query.limit) || 10  // Nb par page (défaut: 10)
    const skip = (page - 1) * limit  // Calcul du saut

    // 2. On compte le total de tâches de l'utilisateur (pour info)
    const total = await Task.countDocuments({ user: req.user._id })

    // 3. On récupère la page demandée
    const tasks = await Task.find({ user: req.user._id })
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })  // Optionnel : les plus récentes d'abord

    // 4. On renvoie une réponse enrichie
    res.status(200).json({
        success: true,
        count: tasks.length,      // Combien dans cette page
        total: total,             // Combien au total
        page: page,               // Page actuelle
        totalPages: Math.ceil(total / limit),  // Combien de pages en tout
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

// Obtenir les statistique des tâche

exports.getTaskStats = CatchAsync(async(req,res,next)=>{
    const stats = await Task.aggregate([
        //le filtre qui ne garde que les tâche de utilisateur connecté
        {
            $match :{user: req.user._id}
        },
        // Regrouper par le champ termine (true/false)
        {
            $group :{
                _id : "$termine",
                nombre: {$sum : 1}
            }
        },
        //filtrer pour l'affisage propre
        {
            $sort : {_id:1}
        }
    ])

    //formater le stats en un objet facile à utilisé
    let totalTermine=0
    let totalEnCours=0
    stats.forEach(stat =>{
        if(stat._id===true) totalTermine=stat.nombre
        if(stat._id===false) totalEnCours= stat.nombre
    })

    res.status(200).json({
        success: true,
        data:{
            total: totalTermine + totalEnCours,
            enCours: totalEnCours,
            termine: totalTermine
        }
    })
})