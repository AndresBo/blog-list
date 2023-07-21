const mongoose = require('mongoose')
const supertest = require('supertest')
const bcrypt = require('bcrypt')
const app = require('../app')
const Blog = require('../models/blog')
const User = require('../models/users')
const helper = require('./test_helper')
// wrap express app with supertest so tests can use it to make HTTP requests to the backend
const api = supertest(app)


describe('when there is initially one user in db', () => {
  // populate db before each test in suit of tests
  beforeEach(async () => {
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('password', 10)
    const user = new User({ username: 'test', passwordHash, name: 'test' })

    await user.save()
  })

  test('creation succeeds with a valid username', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'pablo',
      name: 'Pablo Martin',
      password: 'password',
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)

    const usernames = usersAtEnd.map(u => u.username)
    expect(usernames).toContain(newUser.username)
  })

  test('creation fails with a duplicate username', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'test',
      name: 'Pablo Martin',
      password: 'password',
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(400)

    const usersAtend = await helper.usersInDb()
    expect(usersAtend).toHaveLength(usersAtStart.length)
  })

  test('creation fails with invalid username', async () => {
    const usersAtStart = await helper.usersInDb()
    // usename is < 3 in length
    const newUser = {
      username: 'te',
      name: 'Pablo Martin',
      password: 'password'
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(400)

    const usersAtend = await helper.usersInDb()
    expect(usersAtend).toHaveLength(usersAtStart.length)
  })

  test('creation fails when username is missing', async () => {
    const usersAtStart = await helper.usersInDb()
    // no username
    const newUser = {
      name: 'Pablo Martin',
      password: 'password'
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(400)

    const usersAtend = await helper.usersInDb()
    expect(usersAtend).toHaveLength(usersAtStart.length)
  })

  test('creation fails when password is missing', async () => {
    const usersAtStart = await helper.usersInDb()
    // no password
    const newUser = {
      username: 'pablo',
      name: 'Pablo Martin',
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(400)

    const usersAtend = await helper.usersInDb()
    expect(usersAtend).toHaveLength(usersAtStart.length)
  })
})
