const {gql} = require('apollo-server-fastify')

const typeDefs = gql`
    scalar Upload

    type File {
        filename: String!
        mimetype: String!
        encoding: String!
    }

    type Query {
        getPostById(id: Int!): PostFull
        getPostsWithPagination(page: Int, per_page: Int, orderByPublishedAt: Boolean): PostsAndCount
    }

    type User {
        id: String!
        nickname: String!
        email: String
        photoUrl: String
    }

    input UserCreateInput {
        nickname: String!
        email: String!
        password: String!
    }

    input UserLoginInput {
        email: String!
        password: String!
    }

    type AuthPayLoad {
        token: String!
    }

    type PostFull {
        id: Int
        title: String
        body: String
        published_at: String
        author: User,
        comments: [CommentResponse]
    }

    type PostResponse {
        id: Int
        title: String
        body: String
        published_at: String
        authorsNickname: String
    }

    type Post {
        id: Int
        title: String
        body: String
        published_at: String
        authorsNickname: String
    }

    type PostsAndCount {
        posts: [Post]
        postsCount: Int
    }

    type CommentResponse {
        id: Int
        body: String
        published_at: String
        authorsNickname: String
    }
    
    type Mutation {
        singleUpload(file: Upload!): File!
        signupUser(data: UserCreateInput!) : AuthPayLoad!
        loginUser(data: UserLoginInput!): AuthPayLoad!
        createPost(title: String!, body: String!, published_at: String): PostResponse
        createComment(postId: Int!, body: String!): CommentResponse
    }
`

module.exports = typeDefs