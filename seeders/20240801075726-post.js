'use strict';
require('dotenv/config');
const { Op } = require('sequelize');
const postData = require('../data/posts.json');

function CreateTags(text) {
  let modified = text;
  for (const char of "!@#$%^&*)(_=+?.,;:'")
    modified = modified.split(char).join(' ');
  return modified.split(' ').filter(Boolean);
}

const usernames = postData.map((el) => el.username);

// Create a parameterized query string with placeholders
const placeholders = usernames.map((_, index) => `$${index + 1}`).join(',');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    if (process.env.NODE_ENV === 'production') return;
    const transaction = await queryInterface.sequelize.transaction();
    try {
      const users = await queryInterface.sequelize.query(
        `SELECT id, username FROM "Users" WHERE username IN (${placeholders})`,
        {
          type: Sequelize.QueryTypes.SELECT,
          bind: usernames,
        },
      );

      const posts = [];
      const userPreferences = [];

      postData.forEach((post) => {
        const user = users.find((el) => el.username === post.username);
        const tags = CreateTags(post.text);

        posts.push({
          text: post.text,
          userId: user.id,
          tags,
          allowComment: post.allowComment,
          createdAt: new Date(post.createdAt),
          updatedAt: new Date(),
          privacy: post.privacy,
        });

        userPreferences.push({
          tags,
          userId: user.id,
          createdAt: new Date(post.createdAt),
          updatedAt: new Date(),
        });
      });

      await queryInterface.bulkInsert('Posts', posts, { transaction });
      await queryInterface.bulkInsert('UserPreferences', userPreferences, {
        transaction,
      });

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },

  async down(queryInterface, Sequelize) {
    if (process.env.NODE_ENV === 'production') return;
    const transaction = await queryInterface.sequelize.transaction();
    try {
      const users = await queryInterface.sequelize.query(
        `SELECT id, username FROM "Users" WHERE username IN (${placeholders})`,
        {
          type: Sequelize.QueryTypes.SELECT,
          bind: usernames,
        },
      );

      const userIds = users.map((el) => el.id);

      await queryInterface.bulkDelete(
        'Posts',
        {
          userId: {
            [Op.in]: userIds,
          },
        },
        { transaction },
      );

      await queryInterface.bulkDelete(
        'UserPreferences',
        {
          userId: {
            [Op.in]: userIds,
          },
        },
        { transaction },
      );

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },
};
