require('dotenv').config()
const {GraphQLUpload} = require('graphql-upload')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const {Op} = require('sequelize')
const graphqlFields = require('graphql-fields')

const { auth, userContext } = require('./plugins/auth')
const jwtSecretKey = process.env.JWT_SECRET_KEY

const {User, Post, Comment} = require('./../models')
const {cropAndUploadToS3, checkExtension} = require('./plugins/cropAndUploadToS3')
const {sendEmail} = require('../queues/email.queues')

const resolvers = {

  Upload: GraphQLUpload,

  Query: {
    async getPostById(_, {id}, {req}) {
      await auth(req)
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
      await auth(req)
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
      const token = jwt.sign(payload, jwtSecretKey)
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
      const token = jwt.sign(payload, jwtSecretKey)
      return {token}
    }
    ,

    createPost: async (_, args, {req}) => {

      try {
        const user = await userContext(req)
        const {title, body, published_at} = args
        if(!title || !body) throw new Error(`title and body must be provided`)
        const publishedTime = published_at || Date.now()
        const {id} = await Post.create({authorId: user.id, title, body, published_at: publishedTime})

        return {id, title, body, published_at: publishedTime, authorsNickname: user.nickname}
      } catch (e) {
        return {errors: [e]}
      }

    },

    createComment: async (_, args, {req}) => {
      try {
        const user = await userContext(req)
        const {postId, body} = args
        const post = await Post.findOne({where: {id: postId}, attributes: ['id']})
        if (post === null) throw new Error('Post not found.')
        const publishedTime = Date.now()
        const {id} = await Comment.create({postId, body, authorId: user.id, published_at: publishedTime})

        return {id, body, published_at: publishedTime, authorsNickname: user.nickname}
      } catch (e) {
        return {errors: [e]}
      }
    },

    singleUpload: async (parent, {file}, {req}) => {
      try {
        const user = await userContext(req)
        const {createReadStream, mimetype} = await file
        checkExtension(mimetype)
        const newFileName = `${user.id}.webp`
        const result = await cropAndUploadToS3(createReadStream, newFileName)
        if (result.success !== true) throw new Error(result?.message || 'Unknown error')
        await User.update({photoUrl: result.location}, {where: {id: user.id}})

        return {
          code: 200,
          success: true,
          message: result.message
        }
      } catch (e) {
        return {
          code: 409,
          success: false,
          message: e.message
        }
      }
    },

    sendEmailReport: async (_, args, {req}) => {
      try {
        const user = await userContext(req)
        const {startDate, endDate, email} = args

        const usersPosts = await User.findAll({attributes: ['nickname', 'email'],
          include: [{
            model: Post, as: 'posts', foreignKey: 'authorId', attributes: ['id'],
            where: {published_at: {[Op.between]: [startDate, endDate]}}
        }]})
        const usersComments = await User.findAll({attributes: ['nickname', 'email'],
          include: [{
            model: Comment, as: 'comments', foreignKey: 'authorId', attributes: ['id'],
            where: {published_at: {[Op.between]: [startDate, endDate]}}
          }]})
        await sendEmail({email, usersPosts, usersComments})

        return {success: true, message: 'Report generation started'}
      } catch (e) {
        return {success: false, errors: [e]}
      }
    }
  },
  Post: { // reusing data from parent
    authorsNickname: ({author}) => author.nickname
  },
  PostFull: { // reusing data from parent
    author: ({author}) => author,
    comments: ({comments}) => [...comments]
  }
}

module.exports = resolvers