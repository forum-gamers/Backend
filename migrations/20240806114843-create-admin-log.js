'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('AdminLogs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      adminId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: {
            tableName: 'Admins',
          },
          key: 'id',
        },
      },
      path: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'path is required',
          },
          notNull: {
            msg: 'path is required',
          },
        },
      },
      statusCode: {
        type: Sequelize.INTEGER,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'statusCode is required',
          },
          notNull: {
            msg: 'statusCode is required',
          },
        },
      },
      method: {
        type: Sequelize.ENUM,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'method is required',
          },
          notNull: {
            msg: 'method is required',
          },
        },
        values: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
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
    await queryInterface.dropTable('AdminLogs');
  },
};
