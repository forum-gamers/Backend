module.exports = {
  apps: [
    {
      name: 'backend-forum-gamers',
      script: './dist/main.js',
      instances: 1,
      autoRestart: true,
    },
  ],
};
