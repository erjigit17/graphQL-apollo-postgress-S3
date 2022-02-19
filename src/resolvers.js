const {GraphQLUpload} = require('graphql-upload')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const graphqlFields = require('graphql-fields')

const userContext = require('./userContext')
const {User, Post, Comment} = require('./../models')
const cropAndSaveImage = require('./../utils/cropAndSaveImage')

const resolvers = {

  Upload: GraphQLUpload,

  Query: {
    async getPostById(_, {id}, {req}) {
      await userContext(req)
      const post = await Post.findOne({
        where: {id}, include: [
          {model: User, as: 'author', foreignKey: 'authorId'},
          {
            model: Comment, as: 'comments', foreignKey: 'postId',
            include: [
              {model: User, as: 'author', foreignKey: 'authorId', attributes: ['nickname']},
            ]
          }
        ]
      })
      return post
    },

    async getPostsWithPagination(_, args, {req}, info) {
      await userContext(req)
      const fields = graphqlFields(info)

      const {page,  per_page, orderByPublishedAt} = args
      // pagination
      const offset = page || 0
      const limit = per_page || 5

      const params = {offset, limit}

      // orderBy
      if(orderByPublishedAt) params['order'] = [['published_at', 'DESC']]

      // get only required fields
      const postFields = JSON.parse(JSON.stringify(fields.posts))
      delete postFields.authorsNickname
      const postsAttributes = Object.keys(postFields)
      params['attributes'] = [...postsAttributes]

      let posts
      // join table only if required
      if (fields.posts.authorsNickname) {
        posts = await Post.findAndCountAll({...params,  include: [
            {model: User, as: 'author', foreignKey: 'authorId', attributes: ['nickname']}
          ]})
      } else {
        posts = await Post.findAndCountAll({...params})
      }


      return {posts: posts.rows, postsCount: posts.count}

    },
  },

  Mutation: {
    signupUser: async (_, args) => {
      const {data: {nickname, email, password}} = args

      await User.create({
        nickname,
        email,
        password: await bcrypt.hash(password, 10)
      })
      const payload = {email, nickname}
      payload['exp'] = Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 h
      const token = jwt.sign(payload, 'supersecret')
      return {token}
    },

    loginUser: async (_, args) => {

      const {data: {email, password}} = args
      const theUser = await User.findOne({where: {email}})
      if (!theUser) throw new Error('User not found.')
      const isMatch = bcrypt.compareSync(password, theUser.password)
      if (!isMatch) throw new Error('Password not match.')
      const payload = {email, nickname: theUser.nickname}
      payload['exp'] = Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 h
      const token = jwt.sign(payload, 'supersecret')
      return {token}
    }
    ,

    createPost: async (_, args, {req}) => {

      const user = await userContext(req)
      const {title, body, published_at} = args

      const publishedTime = published_at || Date.now()
      const {id} = await Post.create({authorId: user.id, title, body, published_at: publishedTime})

      return {id, title, body, published_at: publishedTime, authorsNickname: user.nickname}
    },

    createComment: async (_, args, {req}) => {
      const user = await userContext(req)
      const {postId, body} = args
      const post = await Post.findOne({where: {id: postId}, attributes: ['id']})
      if (!post) throw new Error('Post not found.')
      const publishedTime = Date.now()
      const {id} = await Comment.create({postId, body, authorId: user.id, published_at: publishedTime})

      return {id, body, published_at: publishedTime, authorsNickname: user.nickname}
    },

    singleUpload: async (parent, {file}, {req}) => {
      const user = await userContext(req)
      const {createReadStream, filename, mimetype, encoding} = await file
      await cropAndSaveImage(createReadStream, mimetype, user)

      return {filename, mimetype, encoding}
    }
  },
  Post: { // reusing data from parent
    authorsNickname: ({author}) => author.nickname
  },
  PostFull: { // reusing data from parent
    author: ({author}) => author,
    comments: ({comments}) => [...comments]
  },
  CommentResponse: { // reusing data from parent
    authorsNickname: ({author}) => author.nickname
  }
}

module.exports = resolvers