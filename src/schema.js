const {gql} = require('apollo-server');

const typeDefs = gql`
    type Query {
        user(id: String!): User
        allPosts: [Post!]!
        getPostsByWhere(authorId: String!): [Post]
        post(id: String!): Post
    }
    
    type User {
        id: String!
        nickname: String!
        email: String!
        password: String!
        photo_url: String
        posts: [Post]
    }

    type Post {
        id: String!
        title: String!
        body: String!
        published_at: String
        author: User
    }
    
    type Mutation {
        createUser(nickname: String!, email: String!, password: String!): User!
        createPost(authorId: String!, title: String!, body: String!): Post!
    }
`;

module.exports = typeDefs;
