const User = require('../models/users')

const initialBlogs = [
  {
    title: 'blog example 1',
    author: 'a person',
    url: 'a URL',
    likes: 1
  },
  {
    title: 'blog example 2',
    author: 'a person',
    url: 'a URL',
    likes: 2
  }
]

const usersInDb = async () => {
  const users = await User.find({})
  return users.map(user => user.toJSON())
}

module.exports = {
  initialBlogs,
  usersInDb
}
