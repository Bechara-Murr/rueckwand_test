const path = require("path");
module.exports = {
  webpack: {
    alias: {
      "@components": path.resolve(__dirname, "src/Presentation/Components"),
      "@presentation": path.resolve(__dirname, "src/Presentation"),
      "@assets": path.resolve(__dirname, "src/Utils/Assets"),
      "@model": path.resolve(__dirname, "src/Model"),
      "@logic": path.resolve(__dirname, "src/Logic"),
      "@store": path.resolve(__dirname, "src/Store"),
    },
  },
};
