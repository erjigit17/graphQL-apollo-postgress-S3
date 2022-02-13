'use strict'
const {Model, Sequelize} = require('sequelize')

module.exports = (sequelize) => {
  class Comment extends Model {

    static associate(models) {
      const {User, Post, Comment} = models
      Comment.belongsTo(Post, {as: 'post', foreignKey: 'postId', foreignKeyConstraint: true})
      Comment.belongsTo(User, {as: 'author', foreignKey: 'authorId', foreignKeyConstraint: true})
    }
  }

  Comment.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER
    },
    body: Sequelize.STRING,
    authorId: Sequelize.UUID,
    postId: Sequelize.INTEGER,
    published_at: Sequelize.DATE,

    createdAt: {allowNull: false, type: Sequelize.DATE},
    updatedAt: {allowNull: false, type: Sequelize.DATE}
  }, {
    sequelize,
    modelName: 'Comment',
    tableName: 'comments'
  })
  return Comment
}