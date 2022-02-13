const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const graphqlFields = require('graphql-fields')
const {decodedToken} = require('./decodedToken')
const {User, Post, Comment} = require('./../models')


const resolvers = {
  Query: {
    async getPostById(_, {id}, {req}) {
      decodedToken(req)
      const post = await Post.findOne({
        where: {id}, include: [
          {model: User, as: 'author', foreignKey: 'authorId'}
        ]
      })
      return post
    },

    async getPostsWithPagination(_, args, {req}, info) {
      decodedToken(req)
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
      const user = decodedToken(req)
      const {title, body, published_at} = args

      const {id: authorId} = await User.findOne({where: {email: user.email}, attributes: ['id']})
      const publishedTime = published_at || Date.now()
      const {id} = await Post.create({authorId, title, body, published_at: publishedTime})

      return {id, title, body, published_at: publishedTime, authorsNickname: user.nickname}
    }
  },
  Post: { // reusing data
    authorsNickname({author}) {
      return author.nickname
    }
  },
  PostFull: { // reusing data
    author: ({author}) => {
      return author
    }
  }
}

module.exports = resolvers
