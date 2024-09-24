'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('CommunityEvents', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      communityId: {
        type: Sequelize.INTEGER,
        references: {
          model: {
            tableName: 'Communities',
          },
          key: 'id',
        },
        onDelete: 'SET NULL',
        onUpdate: 'SET NULL',
        allowNull: false,
        validate: {
          notNull: {
            msg: 'communityId is required',
          },
          notEmpty: {
            msg: 'communityId is required',
          },
        },
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          notNull: {
            msg: 'title is required',
          },
          notEmpty: {
            msg: 'title is required',
          },
        },
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      location: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          notNull: {
            msg: 'location is required',
          },
          notEmpty: {
            msg: 'location is required',
          },
        },
      },
      startTime: {
        type: Sequelize.DATE,
        allowNull: false,
        validate: {
          notNull: {
            msg: 'startTime is required',
          },
          notEmpty: {
            msg: 'startTime is required',
          },
        },
      },
      endTime: {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: null,
      },
      createdBy: {
        type: Sequelize.UUID,
        references: {
          model: {
            tableName: 'Users',
          },
          key: 'id',
        },
        onDelete: 'SET NULL',
        onUpdate: 'SET NULL',
        allowNull: false,
        validate: {
          notNull: {
            msg: 'createdBy is required',
          },
          notEmpty: {
            msg: 'createdBy is required',
          },
        },
      },
      isPublic: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      status: {
        type: Sequelize.ENUM,
        values: ['scheduled', 'ongoing', 'completed', 'cancelled'],
        defaultValue: 'scheduled',
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

    await queryInterface.addConstraint('CommunityEvents', {
      fields: ['startTime', 'endTime'],
      type: 'check',
      where: {
        [Sequelize.Op.or]: [
          { endTime: null },
          { endTime: { [Sequelize.Op.gt]: Sequelize.col('startTime') } }, // endTime must be greater than startTime
        ],
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('CommunityEvents');
  },
};
