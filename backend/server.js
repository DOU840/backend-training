
const express = require('express')
require('dotenv').config()

const mongoose = require('mongoose')

const dns = require("node:dns")
dns.setServers(["1.1.1.1" , "8.8.8.8"])

const helmet = require('helmet')

const cors = require('cors')

const rateLimit = require('express-rate-limit')

const morgan = require('morgan')

const userRouter = require('./routes/userRouter')

const authRouter = require('./routes/authRouter')

const taskRouter = require('./routes/taskRouter')

const errorHandler = require('./middleware/errorHandler')
const app = express()

app.set('trust proxy', 1);

app.use(helmet())
app.use(cors())

const globalLimit = rateLimit({
    windowMs: 15 * 60 * 1000 ,
    max : 100,
    message:{
        success: false,
        error: 'trop de tentative, réessayer dans 15 minute'
    }
})

app.use(globalLimit)

app.use(express.json())

if(process.env.NODE_ENV==='development'){
    app.use(morgan('dev'))
}else{
    app.use(morgan('combined'))
}
app.use('/users', userRouter)
app.use('/auth', authRouter)
app.use('/tasks', taskRouter)
app.use(errorHandler)

const uri = process.env.NODE_ENV==='test'
? process.env.MONGO_URI_TEST: process.env.MONGO_URI

async function start() {
    try {
        await mongoose.connect(uri)
        console.log(`mongodb connecté ! (${process.env.NODE_ENV || 'development'})`)

        if (process.env.NODE_ENV !== 'test') {
            const PORT = process.env.PORT || 5000
            app.listen(PORT, () =>
                console.log(`🚀 Serveur sur http://localhost:${PORT}`)
            )
        }
    } catch (error) {
        console.error('erreur mongodb', error)
        process.exit(1)
    }
}

if (process.env.NODE_ENV !== 'test') {
    start()
} else {
    // Les tests gèrent leur propre connexion
    mongoose.connect(uri).catch((error) => {
        console.error('erreur mongodb', error)
    })
}

module.exports= app
/*
app.patch('/products/:id',(req,res)=>{
    const product = products.find(p => p.id === Number(req.params.id))
    if(!product){
        return res.status(404).json({message:"produit introuvable"})
    }
    product.nom = req.body.nom
    product.prix = req.body.prix
    res.json(product)
})

app.post('/products',(req,res)=>{
    const {nom, prix}= req.body
    if(!nom || !prix || prix <= 0){
        return res.status(400).json({message:"nom et prix obligatoire"})
    }
    newProduct={
        id:products.length + 1,
        nom,
        prix
    }

    products.push(newProduct)
    res.status(201).json(newProduct)
})

app.get("/products/:id",(req,res)=>{
    const product = products.find(p=> p.id === Number(req.params.id))
    if(!product){
        return res.status(404).json({
            message: "produit introuvable"
        })
    }
    res.status(200).json(product)
})

app.listen(5000, ()=>{
    console.log("server lancé sur http://localhost:5000/contacts")
})
*/

