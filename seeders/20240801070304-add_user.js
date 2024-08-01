'use strict';
require('dotenv/config');

const { v4 } = require('uuid');
const { Op } = require('sequelize');
const userData = require('../data/users.json');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up(queryInterface, Sequelize) {
    /**
     * @description must include --seed to run
     */
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
     */
    if (process.env.NODE_ENV === 'production') return;

    return queryInterface.bulkInsert(
      'Users',
      userData.map((el) => ({
        ...el,
        id: v4(),
        createdAt: new Date(),
        updatedAt: new Date(),
        isVerified: true,
        status: 'active',
      })),
    );
  },

  down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    if (process.env.NODE_ENV === 'production') return;
    return queryInterface.bulkDelete('Users', {
      username: {
        [Op.in]: userData.map((el) => el.username),
      },
    });
  },
};
