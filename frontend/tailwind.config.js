/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                surface: {
                    DEFAULT: '#0f172a',
                    card: '#1e293b',
                    hover: '#273548',
                },
                line: '#334155',
                accent: {
                    DEFAULT: '#6366f1',
                    hover: '#818cf8',
                },
                content: {
                    DEFAULT: '#f1f5f9',
                    muted: '#94a3b8',
                },
                success: '#22c55e',
                warning: '#f59e0b',
                danger: '#ef4444',
            },
        },
    },
    plugins: [],
};
