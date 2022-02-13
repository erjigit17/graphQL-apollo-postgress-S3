'use strict'
const {Model, Sequelize} = require('sequelize')

module.exports = (sequelize) => {
  class Post extends Model {

    static associate(models) {
      const {User, Post, Comment} = models
      Post.belongsTo(User, {as: 'author', foreignKey: 'authorId', foreignKeyConstraint: true})
      Post.hasMany(Comment, {as: 'comments', foreignKey: 'postId', onDelete: 'NO ACTION'})
    }
  }

  Post.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER
    },
    title: Sequelize.STRING,
    body: Sequelize.STRING,
    authorId: Sequelize.UUID,
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