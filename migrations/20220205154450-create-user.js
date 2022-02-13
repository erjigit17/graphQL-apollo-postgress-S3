'use strict'
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true
      },

      nickname: {type: Sequelize.STRING, allowNull: false, unique: true},
      email: {type: Sequelize.STRING, allowNull: false, unique: true},
      password: {type: Sequelize.STRING, allowNull: false},
      photo_url: Sequelize.STRING,

      createdAt: {allowNull: false, type: Sequelize.DATE},
      updatedAt: {allowNull: false, type: Sequelize.DATE}
    })
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('users')
  }
}