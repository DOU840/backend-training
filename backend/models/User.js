const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
// DEFINITION DU SCHEMA
const userSchema=new mongoose.Schema({
    nom :{
        type: String,
        required :  [true, 'le nom est obligatoire'],
        trim: true,
        minlength: [2, 'le nom doit faire au moins 2 caratères']
    },
    email:{
        type: String,
        required : [true , "l'email est obligatoire"],
        unique: true,
        lowercase : true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, "Format d'email invalide"]
    },
    motDePasse:{
        type: String,
        required: [true, 'le mot de passe est obligatoire'],
        minlength: [6, 'le mot de passe doit faire au moins 6 caraactère'],
        select : false
    },
    age:{
        type: Number,
        min: [0, 'Äge invalide'],
        max: [150, 'Äge invalide']
    },
    ville:{
        type: String,
        trim: true
    },
    actif:{
        type: Boolean,
        default: true
    },

    role:{
        type: String,
        enum : ['user', 'admin'],
        default: 'user'
    }
    
},
{timestamps: true}
)
userSchema.pre('save', async function () {
    if(!this.isModified('motDePasse')) return;
    this.motDePasse = await bcrypt.hash(this.motDePasse, 10)
})

userSchema.methods.compareMotDePasse= function (motDePasseEnClair){
    return  bcrypt.compare(motDePasseEnClair, this.motDePasse)
}
const User = mongoose.model('User', userSchema)
module.exports = User