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

describe('when there is initially some blogs saved', () => {
  test('blogs are returned in JSON format', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('two blogs are returned', async () => {
    const response = await api.get('/api/blogs')

    expect(response.body).toHaveLength(2)
  })

  test('blogs have property named id', async () => {
    const response = await api.get('/api/blogs')

    expect(response.body[0].id).toBeDefined()
  })
})

describe('addition of a new blog', () => {
  test('succeeds with valid data', async () => {
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
    expect(contents).toContain('test blog for POST request')
  }, 10000)

  test('with likes property missing defaults to 0', async () => {
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

  test('with a missing title responds with 400 bad request', async () => {
    const newBlog = {
      author: 'example person for POST a blog test',
      url: 'example url',
      likes: 1000
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(400)
  }, 10000)

  test('with missing url responds with 400 bad request', async () => {
    const newBlog = {
      title: 'test blog for POST request',
      author: 'example person for POST a blog test',
      likes: 1000
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(400)
  }, 10000)
})

describe('deletion of a blog', () => {
  test('succeeds with status code 204 if id is valid', async () => {
    const blogsAtStart = await api.get('/api/blogs')

    const blogToDelete = blogsAtStart.body[0]

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .expect(204)

    const notesAtEnd = await api.get('/api/blogs')

    expect(notesAtEnd.body).toHaveLength(helper.initialBlogs.length - 1)

    const titles = notesAtEnd.body.map(r => r.title)

    expect(titles).not.toContain(blogToDelete.title)
  },)
})

// close connection with database after all tests run
afterAll(async () => {
  await mongoose.connection.close()
})
