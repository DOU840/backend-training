
const express = require('express')
require('dotenv').config()

const mongoose = require('mongoose')

const dns = require("node:dns")
dns.setServers(["1.1.1.1" , "8.8.8.8"])

const helmet = require('helmet')

const cors = require('cors')

const rateLimit = require('express-rate-limit')

const userRouter = require('./routes/userRouter')

const authRouter = require('./routes/authRouter')

const taskRouter = require('./routes/taskRouter')

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

const User = require('./models/User')

mongoose.connect(process.env.MONGO_URI)
.then(()=>{
    console.log("mongodb connecté !")
})
.catch((error)=>{
    console.log("erreur mongodb",error)
})

app.use('/users', userRouter)
app.use('/auth', authRouter)
app.use('/tasks', taskRouter)

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Serveur sur le port ${PORT}`));

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

