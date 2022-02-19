const {ApolloServer} = require('apollo-server-fastify')
const {processRequest} = require('graphql-upload')

const uploadToS3 = require('./../utils/uploadToS3')
const typeDefs = require('./schema')
const resolvers = require('./resolvers')

const app = require('fastify')({
  logger: true
})

const start = async () => {
  try {
    // Handle all requests that have the `Content-Type` header set as multipart
    app.addContentTypeParser('multipart', (req, payload, done) => {
      req.isMultipart = true
      done()
    })

    // Format the request body to follow graphql-upload's
    app.addHook('preValidation', async function(req, reply) {
      if (!req.isMultipart) {
        return
      }
      req.body = await processRequest(req.raw, reply.raw)
    })

    const server = new ApolloServer({
      typeDefs,
      resolvers,
      context: req => ({req})
    })

    // Start Apollo Server
    await server.start()
    //
    await uploadToS3()

    app.register(server.createHandler())
    const PORT = 3000
    const URL = await app.listen(PORT)
    console.log(`
      🚀  Server is running
      🔉  Listening on port ${PORT}
      📭  Query at ${URL}/graphql
    `)
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}

start()