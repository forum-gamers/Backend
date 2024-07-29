require('dotenv/config');

module.exports = {
  development: {
    username: 'apple',
    password: 'qwertyui',
    database: 'forum-gamers',
    host: '127.0.0.1',
    dialect: 'postgres',
    uri: process.env.DATABASE_URL,
  },
  test: {
    username: 'apple',
    password: 'qwertyui',
    database: 'forum-gamers-test',
    host: '127.0.0.1',
    dialect: 'postgres',
  },
  production: {
    use_env_variable: 'DATABASE_URL',
    dialectOptions: {
      ssl: {
        rejectUnauthorized: true,
      },
    },
  },
};
