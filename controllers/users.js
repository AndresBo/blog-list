const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/users')

usersRouter.get('/', async (request, response) => {
  const users = await User.find({})
  response.json(users)
})

usersRouter.post('/', async (request, response, next) => {

  const { username, name, password } = request.body

  // don't validate password with mongoose validation in the schema, the password received by
  // backend and the hash saved to db are different things.
  if (!password) {
    return response.status(400).json({ error: 'password is required' })
  } else if (password.length < 3) {
    return response.status(400).json({ error: 'password must be longer than 3 characters' })
  }

  const saltRounds = 10
  const passwordHash = await bcrypt.hash(password, saltRounds)

  const user = new User({
    username,
    name,
    passwordHash,
  })

  try {
    const savedUser = await user.save()

    response.status(201).json(savedUser)
  } catch(exception) {
    next(exception)
  }
})

module.exports = usersRouter
