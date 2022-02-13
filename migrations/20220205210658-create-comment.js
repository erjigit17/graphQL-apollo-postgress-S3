'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('comments', {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
          allowNull: false,
          primaryKey: true
        },

        body: {type: Sequelize.STRING, allowNull: false},
        author_id: {type: Sequelize.UUID, allowNull: true, references: {model: 'users', key: 'id'}},
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