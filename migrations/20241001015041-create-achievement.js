'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Achievements', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'name is required',
          },
          notNull: {
            msg: 'name is required',
          },
        },
      },
      gameId: {
        //can belong to any game
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: { tableName: 'Games' },
          key: 'id',
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
        defaultValue: null,
      },
      communityId: {
        //can belong to any community
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: { tableName: 'Communities' },
          key: 'id',
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
        defaultValue: null,
      },
      imageUrl: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'imageUrl is required',
          },
          notNull: {
            msg: 'imageUrl is required',
          },
        },
      },
      imageId: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'imageId is required',
          },
          notNull: {
            msg: 'imageId is required',
          },
        },
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
        defaultValue: null,
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
    await queryInterface.dropTable('Achievements');
  },
};
