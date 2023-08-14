module.exports = {
    "env": {
        "browser": true,
        "es2021": true
    },
    "extends": [
        "airbnb",
        "airbnb-typescript",
        "airbnb/hooks",
        "plugin:react/recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:prettier/recommended",
    ],
    "overrides": [
    ],
    "parser": "@typescript-eslint/parser",
    "parserOptions": {
        "ecmaVersion": "latest",
        "sourceType": "module",
        "project": "./tsconfig.json"
    },
    "plugins": [
        "react",
        "@typescript-eslint",
        "prettier",
    ],
    "rules": {
        "react/react-in-jsx-scope": 0,
        "react/jsx-filename-extension": [1, { "extensions": [".js", ".jsx", ".ts", ".tsx"] }],
        "import/no-extraneous-dependencies": ["error", { "devDependencies": true }],
        "import/prefer-default-export": "off",
        "no-underscore-dangle": [
            "error",
            { "allow": ["_id"] }
        ],
        'import/extensions': ['error', 'always', {
            'js': 'never',
            'ts': 'never',
            'tsx': 'never',
        }],
    },
    "settings": {
        'import/resolver': {
            node: {
                extensions: ['.js', '.jsx', '.ts', '.tsx'],
            },
        },
    },
}