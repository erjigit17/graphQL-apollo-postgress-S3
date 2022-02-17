const {ApolloServer, gql} = require('apollo-server-fastify')
const {GraphQLUpload, processRequest} = require('graphql-upload')
const {finished} = require('stream/promises')

const cropAndCompressImage = require('./../utils/cropAndCompressImage')
const uploadTo3sBucket = require('./../utils/uploadToS3')

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

      const stream = createReadStream()

      const out = require('fs').createWriteStream('./inputFiles/demo.jpg')
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

    // await cropAndCompressImage()
    await uploadTo3sBucket()
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}

start()