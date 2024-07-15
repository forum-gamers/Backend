module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Users', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false,
      },

      username: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
        validate: {
          notEmpty: {
            msg: 'username is required',
          },
          notNull: {
            msg: 'username is required',
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
      isVerified: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      bio: {
        type: Sequelize.TEXT,
        defaultValue: '',
      },
      imageUrl: {
        type: Sequelize.STRING,
        defaultValue: '',
      },
      imageId: {
        type: Sequelize.STRING,
        defaultValue: '',
      },

      backgroundImageUrl: {
        type: Sequelize.STRING,
        defaultValue: '',
      },

      backgroundImageId: {
        type: Sequelize.STRING,
        defaultValue: '',
      },

      status: {
        type: Sequelize.ENUM,
        values: ['active', 'inActive'],
        defaultValue: 'active',
      },

      phoneNumber: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'phoneNumber is required',
          },
          notNull: {
            msg: 'phoneNumber is required',
          },
        },
        defaultValue: '',
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

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Users');
  },
};
