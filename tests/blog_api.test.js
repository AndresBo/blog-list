const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')

// wrap express app with supertest so tests can use it to make HTTP requests to the backend
const api = supertest(app)

test('blogs are returned in JSON format', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

afterAll(async () => {
  await mongoose.connection.close()
})
