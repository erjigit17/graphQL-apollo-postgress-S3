'use strict'
const {Model, Sequelize} = require('sequelize')

module.exports = (sequelize) => {
  class Comment extends Model {

    static associate(models) {
      const {User, Comment} = models
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
    published_at: Sequelize.STRING,

    createdAt: {allowNull: false, type: Sequelize.DATE},
    updatedAt: {allowNull: false, type: Sequelize.DATE}
  }, {
    sequelize,
    modelName: 'Comment',
    tableName: 'comments'
  })
  return Comment
}