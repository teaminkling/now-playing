module.exports = {
  env: {
    es6: true,
    node: true,
  },
  parser: "@typescript-eslint/parser",
  "parserOptions": {
    "sourceType": "module"
  },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
  ],
  ignorePatterns: [
    "**/lib/**/*",
  ],
  rules: {
    "quotes": ["warn", "double"],
    "semi": [0],
    "@typescript-eslint/semi": ["error"],
    "no-invalid-this": [0],
    "@typescript-eslint/no-invalid-this": ["error"],
    "no-unused-vars": [0],
    "@typescript-eslint/no-unused-vars": ["warn", {
      "argsIgnorePattern": "^_",
      "varsIgnorePattern": "^_",
    }],
    "valid-jsdoc": ["warn", {
      "requireParamType": false,
      "requireReturnType": false,
      "requireReturn": false,
    }],
    "@typescript-eslint/member-delimiter-style": ["error"],
  }
};
