const blogsRouter = require('express').Router()
const jwt = require('jsonwebtoken')
const Blog = require('../models/blog')
const User = require('../models/users')

// helper function isolates the token from the authorization header (MOVED TO MIDDLEWARE tokenExtractor)
// const getTokenFrom = request => {
//   const authorization = request.get('authorization')

//   if (authorization && authorization.startsWith('Bearer ')) {
//     return authorization.replace('Bearer ', '')
//   }
//   return null
// }

// GET ALL
blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 })
  response.json(blogs)
})

// GET INDIVIDUAL
blogsRouter.get('/:id', async (request, response) => {
  const blog = await Blog.find({ _id:request.params.id }).populate('user', { username: 1, name: 1 })
  response.json(blog)
})

// CREATE A NEW BLOG
blogsRouter.post('/', async (request, response) => {

  const body = request.body
  // check validity of jwtoken and decodes the token into the object it was based on
  // PREV VERSION-- const decodedToken = jwt.verify(getTokenFrom(request), process.env.SECRET)
  const decodedToken = jwt.verify(request.token, process.env.SECRET)
  if (!decodedToken.id) {
    return response.status(401).json({ error: 'token invalid' })
  }
  // with decoded object, find the user
  const user = await User.findById(decodedToken.id)

  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes || 0,
    user: user.id
  })

  if(!blog.title) {
    return response.status(400).json({ error: 'blog title is missing' })
  }

  if(!blog.url) {
    return response.status(400).json({ error: 'blog url is missing' })
  }

  const savedBlog = await blog.save()
  // add to user list of created blogs
  user.blogs = user.blogs.concat(savedBlog._id)
  await user.save()
  // get the blog that was just saved and populate it with name of user who created it
  const populatedSavedBlog = await Blog.find({ _id:savedBlog._id }).populate('user', { name: 1 })

  response.status(201).json(populatedSavedBlog)
})

// DELETE A BLOG
blogsRouter.delete('/:id', async (request, response) => {
  // find the blog
  const blog = await Blog.findById(request.params.id)
  //get logged-in user token
  const decodedToken = jwt.verify(request.token, process.env.SECRET)
  if (!decodedToken.id) {
    return response.status(401).json({ error: 'token invalid' })
  }
  // compare user who created the blog to logged in user
  if (blog.user.toString() === decodedToken.id) {
    await Blog.findByIdAndRemove(request.params.id)
    response.status(204).end()
  } else {
    return response.status(401).json({ error: 'Unauthorized to delete the blog' })
  }

})
// using promises:
// blogsRouter.delete('/:id', (request, response) => {
//   Blog.findByIdAndRemove(request.params.id)
//     .then( () => {
//       response.status(204).end()
//     })
// })

// UPDATE A BLOG
blogsRouter.put('/:id', async (request, response) => {
  const body = request.body

  const blog = {
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes,
    user: body.user
  }

  const updateBlog = await Blog.findByIdAndUpdate(request.params.id, blog, { new: true }).populate('user', { username: 1, name: 1 })

  return response.json(updateBlog).status(201)
})

module.exports = blogsRouter
