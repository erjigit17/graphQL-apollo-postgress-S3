'use strict'
const {Model, Sequelize} = require('sequelize')

module.exports = (sequelize) => {
  class Comment extends Model {

    static associate(models) {
      const {User, Comment} = models
      Comment.belongsTo(User, {as: 'author', foreignKey: 'author_id', foreignKeyConstraint: true})
    }
  }

  Comment.init({
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      allowNull: false,
      primaryKey: true
    },

    body: Sequelize.STRING,
    authorId: {type: Sequelize.UUID, field: 'author_id'},
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