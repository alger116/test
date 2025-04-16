module.exports = {
  content: [
    './index.html', // ✅ Ensure Tailwind scans your main HTML file
    './_layouts/**/*.html', // ✅ Jekyll layouts
    './_includes/**/*.html', // ✅ Jekyll includes
    './src/**/*.{html,js}', // ✅ Your custom HTML & JS
    './dist/**/*.css', // ✅ Ensure it checks final CSS files
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
export default {
  content: ['./_site/**/*.html', './_includes/**/*.html', './_layouts/**/*.html', './**/*.md'],
  theme: { extend: {} },
  plugins: [],
};
