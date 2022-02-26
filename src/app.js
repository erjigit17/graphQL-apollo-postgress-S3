require('dotenv').config()
const {ApolloServer} = require('apollo-server-fastify')
const {processRequest} = require('graphql-upload')

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

    app.register(server.createHandler())
    const PORT = process.env.PORT || 3000
    app.listen(PORT, '0.0.0.0', (err) => {
      if (err) {
        app.log.error(err)
        process.exit(1)
      }
    })
    // console.log(`
    //   🚀  Server is running
    //   🔉  Listening on port ${PORT}
    //   📭  Query at ${URL}/graphql
    // `)
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}

start()