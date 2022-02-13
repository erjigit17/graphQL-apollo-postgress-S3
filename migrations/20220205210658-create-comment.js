'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('comments', {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER
        },

        body: {type: Sequelize.STRING, allowNull: false},
        authorId: {type: Sequelize.UUID, allowNull: false, references: {model: 'users', key: 'id'}, onDelete: 'CASCADE'},
        postId: {type: Sequelize.INTEGER, allowNull: false, references: {model: 'posts', key: 'id'}, onDelete: 'CASCADE'},
        published_at: {type: Sequelize.DATE},

        createdAt: {allowNull: false, type: Sequelize.DATE},
        updatedAt: {allowNull: false, type: Sequelize.DATE}
      }
    )
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('comments')
  }
}