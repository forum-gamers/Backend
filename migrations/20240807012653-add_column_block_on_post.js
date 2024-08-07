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
    await queryInterface.addColumn('Posts', 'isBlocked', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
    await queryInterface.addColumn('Posts', 'blockedBy', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: {
          tableName: 'Admins',
        },
        key: 'id',
      },
    });
    await queryInterface.addColumn('Posts', 'blockReason', {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: null,
    });
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.removeColumn('Posts', 'isBlocked');
    await queryInterface.removeColumn('Posts', 'blockedBy');
    await queryInterface.removeColumn('Posts', 'blockReason');
  },
};
