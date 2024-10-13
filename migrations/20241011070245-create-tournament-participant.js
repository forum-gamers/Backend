'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('TournamentParticipants', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      tournamentId: {
        type: Sequelize.INTEGER,
        references: {
          model: {
            tableName: 'Tournaments',
          },
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        allowNull: false,
        validate: {
          notNull: {
            msg: 'Tournament Id is required',
          },
          notEmpty: {
            msg: 'Tournament Id is required',
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
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        allowNull: false,
        validate: {
          notNull: {
            msg: 'Team Id is required',
          },
          notEmpty: {
            msg: 'Team Id is required',
          },
        },
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      status: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        validate: {
          notNull: {
            msg: 'Status is required',
          },
          notEmpty: {
            msg: 'Status is required',
          },
        },
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('TournamentParticipants');
  },
};
