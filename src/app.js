const {ApolloServer, gql} = require('apollo-server-fastify')
const {GraphQLUpload, processRequest} = require('graphql-upload')
const {finished} = require('stream/promises')

// const typeDefs = require('./schema')
// const resolvers = require('./resolvers')

const typeDefs = gql`
    scalar Upload

    type File {
        filename: String!
        mimetype: String!
        encoding: String!
    }

    type Query {
        otherFields: Boolean!
    }

    type Mutation {
        singleUpload(file: Upload!): File!
    }
`

const resolvers = {
  Upload: GraphQLUpload,

  Mutation: {
    singleUpload: async (parent, {file}) => {
      const {createReadStream, filename, mimetype, encoding} = await file
      // See https://nodejs.org/api/stream.html#stream_readable_streams
      const stream = createReadStream()

      const out = require('fs').createWriteStream('tmp.jpg')
      stream.pipe(out)
      await finished(out)

      return {filename, mimetype, encoding}
    }
  }
}

const app = require('fastify')({
  logger: true
})

const start = async () => {
  try {
    // Handle all requests that have the `Content-Type` header set as multipart
    app.addContentTypeParser('multipart', (request, payload, done) => {
      request.isMultipart = true
      done()
    })

    // Format the request body to follow graphql-upload's
    app.addHook('preValidation', async function(request, reply) {
      if (!request.isMultipart) {
        return
      }

      request.body = await processRequest(request.raw, reply.raw)
    })

    const server = new ApolloServer({
      uploads:false,
      typeDefs,
      resolvers
    })

    // Start Apollo Server
    await server.start()

    app.register(server.createHandler())
    await app.listen(3000)
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}

start()

//mutation($file: Upload!){
//   singleUpload(file: $file){
//     filename
//     mimetype
//     encoding
//   }
// }