'use strict';

const games = require('../data/games.json');

if (!games?.length) throw new Error('games.json is empty');

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
    const transaction = await queryInterface.sequelize.transaction();
    try {
      for (const { code, minPlayer } of games)
        await queryInterface.bulkUpdate(
          'Games',
          { minPlayer },
          { code },
          { transaction },
        );

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    const transaction = await queryInterface.sequelize.transaction();
    try {
      for (const { code } of games)
        await queryInterface.bulkUpdate(
          'Games',
          { minPlayer: 1 },
          { code },
          { transaction },
        );
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },
};
