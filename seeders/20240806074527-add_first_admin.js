'use strict';
require('dotenv/config');
const { hashSync } = require('bcryptjs');
const { v4 } = require('uuid');

const fullname = process.env.FIRST_ADMIN_NAME;
const email = process.env.FIRST_ADMIN_EMAIL;
const password = process.env.FIRST_ADMIN_PASSWORD;

if (!email || !password || !fullname)
  throw new Error(
    'Please set FIRST_ADMIN_NAME ,FIRST_ADMIN_EMAIL and FIRST_ADMIN_PASSWORD in .env file',
  );

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
     */
    await queryInterface.bulkInsert('Admins', [
      {
        id: v4(),
        fullname,
        email,
        password: hashSync(password, 10),
        division: 'Director',
        role: 'Manager',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    await queryInterface.bulkDelete('Admins', { email });
  },
};
