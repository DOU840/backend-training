
// tests/auth/test
const request = require('supertest') // import du similateur http
const app= require("../backend/server") // import app express sans app.listen()
console.log('🔍 app =', typeof app)
const mongoose = require('mongoose') // import mongoose 
const User = require('../backend/models/User') // import model user

//=========================================================
// Vider la base avant les test
//==========================================================

beforeAll(async()=>{
    // vider la base

    await User.deleteMany({})
    // creer un user se test
    await User.create({
        "nom":"Test",
        "email": "test@test.com",
        "motDePasse": "secret123",
        "age":25
    })
})
//============================================
// netoie la base apres test
//============================================

afterAll(async()=>{
    // vider la base
    await User.deleteMany({})
    // fermeer la connection

    await mongoose.connection.close()
})

//============================================
// Tests
//============================================

describe('Post auth/login', ()=>{
    //Test1: login reçu
    test('retourne 200 + token',async()=>{
        const res = await request(app)
        .post('/auth/login')
        .send({"email": "test@test.com", "motDePasse":"secret123"})

        // verifications
        expect(res.status).toBe(200)
        expect(res.body.success).toBe(true)
        expect(res.body.data.token).toBeDefined()
        expect(res.body.data.userSansMdp.motDePasse).toBeUndefined()
    })
    //Test2: mauvais mot de passe
    test('retourne 401 + identidiants invalides',async()=>{
        const res = await request(app)
        .post('/auth/login')
        .send({"email": "test@test.com", "motDePasse":"secret124"})

        // verifications
        expect(res.status).toBe(401)
        expect(res.body.success).toBe(false)
        
        
    })
    //Test3: Email inexistant
    test('retourne 401 + identifiants invalides',async()=>{
        const res = await request(app)
        .post('/auth/login')
        .send({"email": "test@teste.com", "motDePasse":"secret123"})

        // verifications
        expect(res.status).toBe(401)
        expect(res.body.success).toBe(false)
    
        
    })
    //Test4: Sans Email
    test('retourne 400 + Email obligatoire',async()=>{
        const res = await request(app)
        .post('/auth/login')
        .send({ "motDePasse":"secret123"})

        // verifications
        expect(res.status).toBe(400)
        expect(res.body.success).toBe(false)
        
        
    })
    //Test5: Sans mot de passe
    test('retourne 400 + Email obligatoire',async()=>{
        const res = await request(app)
        .post('/auth/login')
        .send({"email": "test@test.com"})

        // verifications
        expect(res.status).toBe(400)
        expect(res.body.success).toBe(false)
        
        
    })
})
