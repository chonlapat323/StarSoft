const PORT = process.env.PORT || 3100;

module.exports = {
  apps: [
    {
      name: "starsoft",
      cwd: __dirname,
      script: "node_modules/next/dist/bin/next",
      args: `start -p ${PORT}`,
      env: { NODE_ENV: "production", PORT },
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      max_memory_restart: "512M",
      time: true,
    },
  ],
};
