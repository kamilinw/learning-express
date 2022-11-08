module.exports = {
  parserOptions: {
    sourceType: "module",
  },
  parser: "babel-eslint",
  env: {
    node: true,
  },
  extends: ["eslint:recommended", "standard", "prettier", "prettier/standard"],
  plugins: ["prettier"],
};
