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
    await queryInterface.addColumn('Users', 'isBlocked', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
    await queryInterface.addColumn('Users', 'blockedBy', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: {
          tableName: 'Admins',
        },
        key: 'id',
      },
    });
    await queryInterface.addColumn('Users', 'blockReason', {
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
    await queryInterface.removeColumn('Users', 'isBlocked');
    await queryInterface.removeColumn('Users', 'blockedBy');
    await queryInterface.removeColumn('Users', 'blockReason');
  },
};
