const {gql} = require('apollo-server-fastify')

const typeDefs = gql`
    scalar Upload

    type FileUploadResult {
        "Similar to HTTP status code, represents the status of the mutation"
        code: Int!
        "Indicates whether the mutation was successful"
        success: Boolean!
        "Human-readable message for the UI"
        message: String!
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

    input createPost {
        title: String,
        body: String,
        published_at: Float
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
        published_at: Float
        author: User,
        comments: [CommentResponse]
    }

    type Error {
        name: String
        message: String
        stack: String
    }

    type PostResponse {
        id: Int
        title: String
        body: String
        published_at: Float
        authorsNickname: String
        errors: [Error]
    }

    type Post {
        id: Int
        title: String
        body: String
        published_at: Float
        authorsNickname: String
    }

    type PostsAndCount {
        posts: [Post]
        postsCount: Int
    }

    type CommentResponse {
        id: Int
        body: String
        published_at: Float
        authorsNickname: String
        errors: [Error]
    }

    type SendEmailReportResponse {
        success: Boolean!
        message: String!
        errors: [Error]
    }

    type Mutation {
        singleUpload(file: Upload!): FileUploadResult!
        sendEmailReport(startDate: Float!, endDate: Float!, email: String!): SendEmailReportResponse
        signupUser(data: UserCreateInput!) : AuthPayLoad!
        loginUser(data: UserLoginInput!): AuthPayLoad!
        createPost(title: String, body: String, published_at: Float): PostResponse
        createComment(postId: Int!, body: String!): CommentResponse
    }
`

module.exports = typeDefs