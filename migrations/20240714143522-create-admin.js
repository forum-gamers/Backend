'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Admins', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false,
      },
      fullname: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'fullname is required',
          },
          notNull: {
            msg: 'fullname is required',
          },
        },
      },
      email: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'email is required',
          },
          notNull: {
            msg: 'email is required',
          },
        },
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          notNull: {
            msg: 'password is required',
          },
          notEmpty: {
            msg: 'password is required',
          },
        },
      },
      division: {
        type: Sequelize.ENUM,
        values: [
          'Director',
          'Finance',
          'IT',
          'Third Party',
          'Customer Service',
          'Marketing',
        ],
        allowNull: false,
      },
      role: {
        type: Sequelize.ENUM,
        values: ['Supervisor', 'Manager', 'Staff'],
        allowNull: false,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Admins');
  },
};
