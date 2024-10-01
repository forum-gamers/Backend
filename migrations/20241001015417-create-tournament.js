'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Tournaments', {
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
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: {
            tableName: 'Games',
          },
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        validate: {
          notEmpty: {
            msg: 'gameId is required',
          },
          notNull: {
            msg: 'gameId is required',
          },
        },
      },
      pricePool: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'pricePool is required',
          },
          notNull: {
            msg: 'pricePool is required',
          },
          min: {
            args: 0,
            msg: 'pricePool must be greater than 0',
          },
        },
      },
      slot: {
        type: Sequelize.INTEGER,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'slot is required',
          },
          notNull: {
            msg: 'slot is required',
          },
          min: {
            args: 0,
            msg: 'slot must be greater than 0',
          },
        },
      },
      startDate: {
        type: Sequelize.DATE,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'startDate is required',
          },
          notNull: {
            msg: 'startDate is required',
          },
        },
      },
      registrationFee: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'registrationFee is required',
          },
          notNull: {
            msg: 'registrationFee is required',
          },
          min: {
            args: 0,
            msg: 'registrationFee must be greater than equal 0',
          },
        },
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
        defaultValue: null,
      },
      status: {
        type: Sequelize.ENUM,
        values: ['preparation', 'started', 'finished'],
        defaultValue: 'preparation',
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: {
            tableName: 'Users',
          },
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        defaultValue: null,
      },
      communityId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: {
            tableName: 'Communities',
          },
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        defaultValue: null,
      },
      location: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'location is required',
          },
          notNull: {
            msg: 'location is required',
          },
        },
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
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
      tags: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        allowNull: false,
        defaultValue: [],
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
    await queryInterface.dropTable('Tournaments');
  },
};
