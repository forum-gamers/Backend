'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('TeamAchievements', {
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
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'achievementId is required',
          },
          notNull: {
            msg: 'achievementId is required',
          },
        },
      },
      teamId: {
        type: Sequelize.UUID,
        references: {
          model: {
            tableName: 'Teams',
          },
          key: 'id',
        },
        onDelete: 'SET NULL',
        onUpdate: 'SET NULL',
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'teamId is required',
          },
          notNull: {
            msg: 'teamId is required',
          },
        },
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
    await queryInterface.dropTable('TeamAchievements');
  },
};
