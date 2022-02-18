'use strict'
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('posts', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },

      title: {type: Sequelize.STRING, allowNull: false},
      body: {type: Sequelize.STRING(2048), allowNull: false},
      authorId: {type: Sequelize.UUID, allowNull: false, references: {model: 'users', key: 'id'}, onDelete: 'CASCADE'},
      published_at: {type: Sequelize.DATE},

      createdAt: {allowNull: false, type: Sequelize.DATE},
      updatedAt: {allowNull: false, type: Sequelize.DATE}
    })
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('posts')
  }
}