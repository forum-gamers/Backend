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
    await queryInterface.addColumn('Tournaments', 'moneyPool', {
      type: Sequelize.DECIMAL(15, 2),
      defaultValue: 0,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'moneyPool is required',
        },
        notNull: {
          msg: 'moneyPool is required',
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
    await queryInterface.removeColumn('Tournaments', 'moneyPool');
  },
};
