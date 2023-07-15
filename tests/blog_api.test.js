const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const Blog = require('../models/blog')
const helper = require('./test_helper')
// wrap express app with supertest so tests can use it to make HTTP requests to the backend
const api = supertest(app)

// initialize database before each test
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

test('there are two blogs', async () => {
  const response = await api.get('/api/blogs')

  expect(response.body).toHaveLength(2)
})

test('blogs have property named id', async () => {
  const response = await api.get('/api/blogs')

  expect(response.body[0].id).toBeDefined()
})

test('a valid blog can be added', async () => {
  const newBlog = {
    title: 'test blog for POST request',
    author: 'example person for POST a blog test',
    url: 'example url',
    likes: 1000
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const response = await api.get('/api/blogs')

  const contents = response.body.map(r => r.title)

  expect(response.body).toHaveLength(helper.initialBlogs.length + 1)
  expect(contents).toContain('example blog for POST a blog test')
}, 10000)

test('when adding a blog, if likes property is missing, it defaults to 0', async () => {
  // new blog without likes property
  const newBlog = {
    title: 'test blog for POST request',
    author: 'example author',
    url: 'example url'
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const response = await api.get('/api/blogs')

  const likes = response.body.map(r => r.likes)
  expect(response.body).toHaveLength(helper.initialBlogs.length + 1)
  expect(likes).toContain(0)
})

afterAll(async () => {
  await mongoose.connection.close()
})
