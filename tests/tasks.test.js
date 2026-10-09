const request = require('supertest')
const app = require('../backend/server')
const mongoose = require('mongoose')
const User = require('../backend/models/User')
const Task = require('../backend/models/Task')

// ⬇️ Variables partagées
let tokenA, tokenB
let userAId
let taskAId

// =========================================================
// SETUP
// =========================================================
beforeAll(async () => {
    // 1. Vider les bases
    await User.deleteMany({})
    await Task.deleteMany({})

    // 2. Créer user A
    await User.create({
        nom: 'UserA',
        email: 'usera@test.com',
        motDePasse: 'secret123',
        age: 25
    })

    // 3. Créer user B
    await User.create({
        nom: 'UserB',
        email: 'userb@test.com',
        motDePasse: 'secret456',
        age: 30
    })

    // 4. Login A
    const loginA = await request(app)
        .post('/auth/login')
        .send({ email: 'usera@test.com', motDePasse: 'secret123' })
    tokenA = loginA.body.data.token
    userAId = loginA.body.data.userSansMdp._id

    // 5. Login B
    const loginB = await request(app)
        .post('/auth/login')
        .send({ email: 'userb@test.com', motDePasse: 'secret456' })
    tokenB = loginB.body.data.token
}, 30000)

afterAll(async () => {
    await User.deleteMany({})
    await Task.deleteMany({})
    await mongoose.connection.close()
}, 30000)

// =========================================================
// TESTS : POST /tasks
// =========================================================
describe('POST /tasks', () => {

    test('✅ crée une tâche avec auth → 201', async () => {
        const res = await request(app)
            .post('/tasks')
            .set('Authorization', `Bearer ${tokenA}`)
            .send({ titre: 'Ma première tâche', description: 'Description' })

        expect(res.status).toBe(201)
        expect(res.body.success).toBe(true)
        expect(res.body.data.titre).toBe('Ma première tâche')

        taskAId = res.body.data._id   // ⬅️ Sauvegarde pour plus tard
    })

    test('❌ refuse sans token → 401', async () => {
        const res = await request(app)
            .post('/tasks')
            .send({ titre: 'Sans auth' })

        expect(res.status).toBe(401)
    })

    test('❌ refuse sans titre → 400', async () => {
        const res = await request(app)
            .post('/tasks')
            .set('Authorization', `Bearer ${tokenA}`)
            .send({ description: 'Sans titre' })

        expect(res.status).toBe(400)
    })

})

// =========================================================
// TESTS : GET /tasks
// =========================================================
describe('GET /tasks', () => {

    test('✅ récupère les tâches de l\'user connecté', async () => {
        const res = await request(app)
            .get('/tasks')
            .set('Authorization', `Bearer ${tokenA}`)

        expect(res.status).toBe(200)
        expect(res.body.data.length).toBeGreaterThan(0)
    })

    test('❌ refuse sans token → 401', async () => {
        const res = await request(app).get('/tasks')
        expect(res.status).toBe(401)
    })

    test('🎯 user B ne voit PAS les tâches de user A', async () => {
        const res = await request(app)
            .get('/tasks')
            .set('Authorization', `Bearer ${tokenB}`)

        expect(res.status).toBe(200)
        expect(res.body.data).toEqual([])   // ⬅️ Tableau vide
    })

})

// =========================================================
// TESTS : GET /tasks/:id (NOUVEAU !)
// =========================================================
describe('GET /tasks/:id', () => {

    test('✅ user A récupère SA tâche → 200', async () => {
        const res = await request(app)
            .get(`/tasks/${taskAId}`)
            .set('Authorization', `Bearer ${tokenA}`)

        expect(res.status).toBe(200)
        expect(res.body.success).toBe(true)
        expect(res.body.data._id).toBe(taskAId)
    })

    test('❌ refuse sans token → 401', async () => {
        const res = await request(app).get(`/tasks/${taskAId}`)
        expect(res.status).toBe(401)
    })

    test('🎯 user B ne peut PAS voir la tâche de A → 404', async () => {
        const res = await request(app)
            .get(`/tasks/${taskAId}`)
            .set('Authorization', `Bearer ${tokenB}`)

        expect(res.status).toBe(404)   // ⬅️ Pas 403, pour ne pas révéler l'existence
    })

    test('❌ ID invalide → 400', async () => {
        const res = await request(app)
            .get('/tasks/id_bidon')
            .set('Authorization', `Bearer ${tokenA}`)

        expect(res.status).toBe(400)   // ⬅️ CastError → 400
    })

})

// =========================================================
// TESTS : PUT /tasks/:id (sécurité)
// =========================================================
describe('PUT /tasks/:id', () => {

    test('🎯 user B ne peut PAS modifier la tâche de A → 404', async () => {
        const res = await request(app)
            .put(`/tasks/${taskAId}`)
            .set('Authorization', `Bearer ${tokenB}`)
            .send({ titre: 'Hack' })

        expect(res.status).toBe(404)
    })

})

// =========================================================
// TESTS : DELETE /tasks/:id (sécurité)
// =========================================================
describe('DELETE /tasks/:id', () => {

    test('🎯 user B ne peut PAS supprimer la tâche de A → 404', async () => {
        const res = await request(app)
            .delete(`/tasks/${taskAId}`)
            .set('Authorization', `Bearer ${tokenB}`)

        expect(res.status).toBe(404)
    })

})