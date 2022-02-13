'use strict'
const {Model, Sequelize} = require('sequelize')

module.exports = (sequelize) => {
  class Post extends Model {

    static associate(models) {
      const {User, Post} = models
      Post.belongsTo(User, {as: 'author', foreignKey: 'author_id', foreignKeyConstraint: true})
    }
  }

  Post.init({
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      allowNull: false,
      primaryKey: true
    },

    title: Sequelize.STRING,
    body: Sequelize.STRING,
    authorId: {type: Sequelize.UUID, field: 'author_id'},
    published_at: Sequelize.DATE,

    createdAt: {allowNull: false, type: Sequelize.DATE},
    updatedAt: {allowNull: false, type: Sequelize.DATE}
  }, {
    sequelize,
    modelName: 'Post',
    tableName: 'posts'
  })
  return Post
}