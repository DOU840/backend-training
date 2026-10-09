const request = require('supertest')
const app = require('../backend/server')
const mongoose = require('mongoose')
const User = require('../backend/models/User')

let tokenUser, tokenAdmin

// =========================================================
// SETUP
// =========================================================
beforeAll(async () => {
    await User.deleteMany({})

    // User normal
    await User.create({
        nom: 'Normal',
        email: 'normal@test.com',
        motDePasse: 'secret123',
        age: 25,
        role: 'user'
    })

    // Admin
    await User.create({
        nom: 'Admin',
        email: 'admin@test.com',
        motDePasse: 'secret456',
        age: 30,
        role: 'admin'
    })

    // Login des 2
    const loginUser = await request(app)
        .post('/auth/login')
        .send({ email: 'normal@test.com', motDePasse: 'secret123' })
    tokenUser = loginUser.body.data.token

    const loginAdmin = await request(app)
        .post('/auth/login')
        .send({ email: 'admin@test.com', motDePasse: 'secret456' })
    tokenAdmin = loginAdmin.body.data.token
}, 30000)

afterAll(async () => {
    await User.deleteMany({})
    await mongoose.connection.close()
}, 30000)

// =========================================================
// TESTS : GET /users (admin only)
// =========================================================
describe('GET /users (admin only)', () => {

    test('✅ admin peut lister tous les users → 200', async () => {
        const res = await request(app)
            .get('/users')
            .set('Authorization', `Bearer ${tokenAdmin}`)

        expect(res.status).toBe(200)
        expect(res.body.success).toBe(true)
    
    
    })

    test('🎯 user normal NE PEUT PAS lister → 403', async () => {
        const res = await request(app)
            .get('/users')
            .set('Authorization', `Bearer ${tokenUser}`)

        expect(res.status).toBe(403)
        expect(res.body.success).toBe(false)
    })

    test('❌ sans token → 401', async () => {
        const res = await request(app).get('/users')

        expect(res.status).toBe(401)
        expect(res.body.success).toBe(false)
    })

})

// =========================================================
// TESTS : DELETE /users/:id (admin only)
// =========================================================
describe('DELETE /users/:id (admin only)', () => {

    test('🎯 user normal NE PEUT PAS supprimer → 403', async () => {
        // On récupère un ID pour tester
        const someUser = await User.findOne({ email: 'admin@test.com' })

        const res = await request(app)
            .delete(`/users/${someUser._id}`)
            .set('Authorization', `Bearer ${tokenUser}`)

        expect(res.status).toBe(403)
        expect(res.body.success).toBe(false)
    })

})