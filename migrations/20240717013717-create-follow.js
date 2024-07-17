'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Follows', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      followerId: {
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
      followedId: {
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
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });

    await queryInterface.addConstraint('Follows', {
      fields: ['followerId', 'followedId'],
      type: 'unique',
      name: 'unique_follow_relationship',
    });

    await queryInterface.addIndex('Follows', {
      fields: ['followerId'],
      name: 'idx_followerId',
    });

    await queryInterface.addIndex('Follows', {
      fields: ['followedId'],
      name: 'idx_followedId',
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Follows');
  },
};
