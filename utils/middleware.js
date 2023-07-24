const logger = require('./logger')

const requestLogger = (request, response, next) => {
  logger.info('Method:', request.method)
  logger.info('Path:  ', request.path)
  logger.info('Body:  ', request.body)
  logger.info('---')
  next()
}
// isolate jason web token from authorization header and places it into request.token
const tokenExtractor = (request, response, next) => {
  const authorization = request.get('authorization')

  if (authorization && authorization.startsWith('Bearer ')) {
    request['token'] = authorization.substring(7)
  }

  next()
}

const unknownEndPoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

const errorHandler = (error, request, response, next) => {
  console.log('HI FROM ERROR HANDLER')
  logger.error('ERROR MESSAGE', error.message)
  logger.error('ERROR NAME', error.name)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error:error.message })
  } else if (error.code === 11000) {
    return response.status(400).json({ error: 'duplicate username' })
  } else if (error.name === 'JsonWebTokenError') {
    return response.status(400).json({ error: error.message })
  }
  next(error)
}

module.exports = {
  requestLogger,
  unknownEndPoint,
  errorHandler,
  tokenExtractor

}
