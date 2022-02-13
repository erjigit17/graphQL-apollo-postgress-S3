const { ApolloServer } = require('apollo-server');

const typeDefs = require('./schema')
const resolvers = require('./resolvers')
const models = require('../models')

async function startApolloServer(typeDefs, resolvers) {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: { models }
  })

  const {url, port} = await server.listen()
  console.log(`
      🚀  Server is running
      🔉  Listening on port ${port}
      📭  Query at ${url}
    `)
}

startApolloServer(typeDefs, resolvers)
