'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Transactions', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false,
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: {
            tableName: 'Users',
          },
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      amount: {
        type: Sequelize.FLOAT,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'amount is required',
          },
          notNull: {
            msg: 'amount is required',
          },
        },
      },
      type: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'type is required',
          },
          notNull: {
            msg: 'type is required',
          },
        },
      },
      currency: {
        type: Sequelize.ENUM,
        values: ['USD', 'IDR'],
        defaultValue: 'IDR',
      },
      status: {
        type: Sequelize.ENUM,
        values: [
          'pending',
          'completed',
          'failed',
          'cancel',
          'refund',
          'settlement',
          'deny',
          'expire',
        ],
        defaultValue: 'pending',
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      discount: {
        type: Sequelize.FLOAT,
        defaultValue: 0,
      },
      detail: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      signature: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'signature is required',
          },
          notNull: {
            msg: 'signature is required',
          },
        },
      },
      fee: {
        type: Sequelize.FLOAT,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'fee is required',
          },
          notNull: {
            msg: 'fee is required',
          },
        },
      },
      tax: {
        type: Sequelize.FLOAT,
        defaultValue: 0,
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
    await queryInterface.dropTable('Transactions');
  },
};
