const config = require('./utils/config')
const express = require('express')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose')
const logger = require('./utils/logger')
const blogsRouter = require('./controllers/blogs')


mongoose.connect(config.MONGODB_URI)
  .then(() => {
    logger.info('connected to MongoDB')
  })

app.use(cors())
app.use(express.json())

app.use('/api/blogs', blogsRouter)

module.exports = app
