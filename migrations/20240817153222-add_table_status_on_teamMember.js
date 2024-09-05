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
    await queryInterface.addColumn('TeamMembers', 'status', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    });
    await queryInterface.addColumn('TeamMembers', 'role', {
      type: Sequelize.ENUM,
      values: ['owner', 'member', 'coach', 'inspector', 'manager', 'admin'],
      defaultValue: 'member',
    });
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.removeColumn('TeamMembers', 'status');
    await queryInterface.removeColumn('TeamMembers', 'role');
  },
};