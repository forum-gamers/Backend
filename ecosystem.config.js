module.exports = {
  apps: [
    {
      name: 'backend-gamers-hub',
      script: './dist/main.js',
      instances: 1,
      autoRestart: true,
      interpreter: '~/.bun/bin/bun',
    },
  ],
};
