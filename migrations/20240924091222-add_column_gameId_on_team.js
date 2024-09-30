'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.addColumn('Teams', 'gameId', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: {
          tableName: 'Games',
        },
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      validate: {
        notEmpty: {
          msg: 'gameId cannot be empty',
        },
        notNull: {
          msg: 'gameId cannot be empty',
        },
      },
    });
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.removeColumn('Teams', 'gameId');
  },
};
