const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const Blog = require('../models/blog')
const helper = require('./test_helper')
// wrap express app with supertest so tests can use it to make HTTP requests to the backend
const api = supertest(app)

// initialize database before tests
beforeEach(async () => {
  await Blog.deleteMany({})

  for (let blog of helper.initialBlogs) {
    let blogObject = new Blog(blog)
    await blogObject.save()
  }
})

test('blogs are returned in JSON format', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

afterAll(async () => {
  await mongoose.connection.close()
})
