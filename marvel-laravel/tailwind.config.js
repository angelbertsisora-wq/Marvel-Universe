import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ['Figtree', ...defaultTheme.fontFamily.sans],
                zentry: ['zentry', 'sans-serif'],
                general: ['general', 'sans-serif'],
                'circular-web': ['circular-web', 'sans-serif'],
                'robert-medium': ['robert-medium', 'sans-serif'],
                'robert-regular': ['robert-regular', 'sans-serif'],
            },
            colors: {
                blue: {
                    50: '#DFDFF0',
                    75: '#DFDFF2',
                    100: '#F0F2FA',
                    200: '#010101',
                    300: '#4FB7DD',
                },
                violet: {
                    300: '#5724FF',
                },
                yellow: {
                    100: '#8E983F',
                    300: '#EDFF66',
                },
            },
            animation: {
                fadeIn: 'fadeIn 0.3s ease-out',
                fadeInContent: 'fadeInContent 0.5s ease-out',
            },
        },
    },

    plugins: [forms],
};
