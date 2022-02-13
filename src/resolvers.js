const bcrypt = require('bcryptjs');
const graphqlFields = require('graphql-fields');


const resolvers = {
  Query: {
    async user(root, { id }, { models }, info) {
      const _ = graphqlFields(info)
      const userFields = JSON.parse(JSON.stringify(_))
      delete userFields.posts
      const userAttributes = Object.keys(userFields)
      const postsAttributes = _.posts ? Object.keys(_.posts) : []



      return models.User.findOne({where: {id},
        attributes: [...userAttributes],
        include: [
          {
            model:  models.Post, as: 'posts',  foreignKey: 'author_id',
            attributes: [...postsAttributes]
          }
        ]
      })
    },
    async allPosts(root, args, { models }) {
      return models.Post.findAll();
    },
    async getPostsByWhere(root, { authorId }, { models }) {
      return models.Post.findAll({where: { authorId }});
    },
    async post(root, { id }, { models }) {
      const post = await models.Post.findOne({where: { id }, include: [
        {model:  models.User, as: 'author',  foreignKey: 'author_id'}
        ]
      })
      return post
    },
  },
  Mutation: {
    async createUser(root, { nickname, email, password }, { models }) {
      return models.User.create({
        nickname,
        email,
        password: await bcrypt.hash(password, 10),
      });
    },
    async createPost(
      root,
      { authorId, title, body},
      { models }
    ) {
      return models.Post.create({
        authorId, title, body, published_at: Date.now()
      });
    },
  },
  User: {
      posts({posts}) {
      return posts
    },
  },
  Post: {
    author: ({author}) => {
      return author
    },
  }
};

module.exports = resolvers;
