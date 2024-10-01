'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('UserAchievements', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      achievementId: {
        type: Sequelize.INTEGER,
        references: {
          model: {
            tableName: 'Achievements',
          },
          key: 'id',
        },
        onDelete: 'SET NULL',
        onUpdate: 'SET NULL',
      },
      userId: {
        type: Sequelize.UUID,
        references: {
          model: {
            tableName: 'Users',
          },
          key: 'id',
        },
        onDelete: 'SET NULL',
        onUpdate: 'SET NULL',
        validate: {
          notNull: {
            msg: 'userId is required',
          },
          notEmpty: {
            msg: 'userId is required',
          },
        },
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
    await queryInterface.dropTable('UserAchievements');
  },
};
