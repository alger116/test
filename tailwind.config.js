module.exports = {
  darkmode: "class",
  content: [
    "./index.html", // ✅ Main HTML file
    "./admin.html",
    "./login.html",
    "./timeline.html",
    "./register.html",
    "./_layouts/**/*.html", // ✅ Jekyll layouts
    "./_includes/**/*.html", // ✅ Jekyll includes
    "./src/**/*.{html,js}", // ✅ Custom HTML & JS
    "./_site/**/*.html", // ✅ Jekyll generated output
    "./**/*.md", // ✅ Markdown files (if used in Jekyll)
  ],
  theme: {
    extend: {
      colors: {
        mint: "hsl(178, 72%, 11%)",
        primary: "hsl(217, 100%, 50%)",
        secondary: "hsl(217, 100%, 50%)",
        background: "hsl(217, 100%, 50%)",
        text: "hsl(217, 100%, 50%)",
        accent: "hsl(217, 100%, 50%)",
      },
      spacing: {
        "progress-margin": "4px", // Adjust spacing under progress bars
      },
      borderRadius: {
        progress: "6px", // Ensure smooth rounded edges
      },
      height: {
        "progress-bar": "6px", // Make progress bars thinner
      },
      fontFamily: {
        mono: ["JetBrains Mono", "monospace"],
      },
    },
  },

  plugins: [require("daisyui")],

  // daisyUI config (optional - here are the default values)
  daisyui: {
    themes: "false", // false: only light + dark | true: all themes | array: specific themes like this ["light", "dark", "cupcake"]
    darkTheme: "dark", // name of one of the included themes for dark mode
    base: true, // applies background color and foreground color for root element by default
    styled: false, // include daisyUI colors and design decisions for all components
    utils: true, // adds responsive and modifier utility classes
    prefix: "", // prefix for daisyUI classnames (components, modifiers and responsive class names. Not colors)
    logs: true, // Shows info about daisyUI version and used config in the console when building your CSS
    themeRoot: ":root", // The element that receives theme color CSS variables
  },
};
