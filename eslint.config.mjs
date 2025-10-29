import js from '@eslint/js';
import globals from 'globals';
import { defineConfig } from 'eslint/config';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';

export default defineConfig([
    {
        files: ['**/*.{js,mjs,cjs}'],
        plugins: { js },
        extends: ['js/recommended'],
    },
    { files: ['**/*.js'], languageOptions: { sourceType: 'commonjs' } },
    { files: ['**/*.{js,mjs,cjs}'], languageOptions: { globals: globals.node } },
    js.configs.recommended,
    {
        rules: {
            'prettier/prettier': [
                'error',
                {
                    tabWidth: 4,
                    semi: true,
                    singleQuote: true,
                    printWidth: 120,
                    endOfLine: 'auto',
                    parser: 'flow',
                    trailingComma: 'es5',
                },
            ],
        },
    },
    eslintPluginPrettierRecommended,
]);
