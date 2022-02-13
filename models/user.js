'use strict'
const {Model, Sequelize} = require('sequelize')

module.exports = (sequelize) => {
  class User extends Model {

    static associate(models) {
      const {User, Post, Comment} = models
      User.hasMany(Post, {as: 'posts', foreignKey: 'author_id', onDelete: 'CASCADE'})
      User.hasMany(Comment, {as: 'comments', foreignKey: 'author_id', onDelete: 'CASCADE'})
    }
  }

  User.init({
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      allowNull: false,
      primaryKey: true
    },
    nickname: {
      type: Sequelize.STRING,
      unique: {args: true, message: 'Nickname must be unique!'}
    },
    email: {
      type: Sequelize.STRING,
      unique: {args: true, message: 'Email must be unique!'},
      validate: {
        isEmail: {args: true, msg: 'Invalid email'}
      }
    },
    password: {type: Sequelize.STRING, allowNull: false,},
    photo_url: Sequelize.STRING,

    createdAt: {allowNull: false, type: Sequelize.DATE},
    updatedAt: {allowNull: false, type: Sequelize.DATE}
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'users'
  })
  return User
}