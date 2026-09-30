const mongoose = require('mongoose')

const taskSchema = mongoose.Schema({
    titre:{
        type: String,
        required: true,
        max : [100, 'caractères']
    },
    description:{
        type:String
    },
    termine:{
        type:Boolean,
        default: false
    },
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref : 'User',
        require : true
    }

    
},
{ timestamps : true}
)

const Task = mongoose.model('Task', taskSchema)

module.exports = Task