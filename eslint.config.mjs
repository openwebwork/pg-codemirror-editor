import globals from 'globals';
import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintConfigPrettier from 'eslint-config-prettier';
import stylistic from '@stylistic/eslint-plugin';

export default [
    { ignores: ['**/dist/*', '**/lib/*', 'server/src/perl/pg/*'] },
    { files: ['**/*.{js,mjs,cjs,ts}'] },
    pluginJs.configs.recommended,
    ...tseslint.configs.recommended,
    eslintConfigPrettier,
    {
        languageOptions: { globals: { ...globals.node, ...globals.browser } },
        plugins: { '@stylistic': stylistic },
        rules: {
            // General syntax
            '@stylistic/array-bracket-spacing': ['error', 'never'],
            '@stylistic/arrow-parens': 'off',
            '@stylistic/arrow-spacing': ['error'],
            '@stylistic/brace-style': ['error', '1tbs', { allowSingleLine: true }],
            '@stylistic/comma-dangle': ['error', 'never'],
            '@stylistic/comma-spacing': ['error', { before: false, after: true }],
            '@stylistic/generator-star-spacing': 'off',
            '@stylistic/keyword-spacing': ['error'],
            '@stylistic/max-len': ['error', { ignoreUrls: true, ignoreStrings: true, code: 120 }],
            '@stylistic/multiline-ternary': 'off',
            '@stylistic/no-multiple-empty-lines': ['error', { max: 1, maxEOF: 0, maxBOF: 1 }],
            '@stylistic/no-tabs': ['error'],
            '@stylistic/no-trailing-spaces': ['error'],
            '@stylistic/object-curly-spacing': ['error', 'always'],
            '@stylistic/quotes': ['warn', 'single', { avoidEscape: true }],
            '@stylistic/semi': ['error', 'always'],
            '@stylistic/space-before-blocks': ['error', 'always'],
            '@stylistic/space-before-function-paren': [
                'error',
                { named: 'never', anonymous: 'never', asyncArrow: 'ignore' }
            ],
            '@stylistic/space-in-parens': ['error', 'never'],
            '@stylistic/space-infix-ops': ['error'],

            'no-void': 'off',
            'one-var': 'off',

            // Allow console and debugger during development only.
            'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
            'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off'
        }
    }
];