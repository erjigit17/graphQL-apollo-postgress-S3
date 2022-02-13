'use strict'
const {Model, Sequelize} = require('sequelize')

module.exports = (sequelize) => {
  class User extends Model {

    static associate(models) {
      const {User, Post, Comment} = models
      User.hasMany(Post, {as: 'posts', foreignKey: 'authorId', onDelete: 'NO ACTION'})
      User.hasMany(Comment, {as: 'comments', foreignKey: 'authorId', onDelete: 'NO ACTION'})
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
    photoUrl: Sequelize.STRING,

    createdAt: {allowNull: false, type: Sequelize.DATE},
    updatedAt: {allowNull: false, type: Sequelize.DATE}
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'users'
  })
  return User
}