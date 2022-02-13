const {gql} = require('apollo-server');

const typeDefs = gql`
    type Query {
        getPostById(id: String!): PostFull
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
        author: User
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
    
    type Mutation {
        signupUser(data: UserCreateInput!) : AuthPayLoad!
        loginUser(data: UserLoginInput!): AuthPayLoad!
        createPost(title: String!, body: String!, published_at: String): PostResponse
    }
`;

module.exports = typeDefs;
