module.exports = {
  darkmode: "class",
  content: [
    "./index.html", // ✅ Main HTML file
    "./admin.html",
    "./login.html",
    "./sidebar.html",
    "./timeline.html",
    "./register.html",
    "./_layouts/**/*.html", // ✅ Jekyll layouts
    "./_includes/**/*.html", // ✅ Jekyll includes
    "./src/**/*.{html,js}", // ✅ Custom HTML & JS
    "./_site/**/*.html", // ✅ Jekyll generated output
    "./**/*.md", // ✅ Markdown files (if used in Jekyll)
    "./ostu/**/*.html",
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
        // New color palette - using HSL format for Tailwind v4 compatibility
        "ocean-blue": "hsl(201, 100%, 36%)",
        "cloudy-sky": "hsl(196, 53%, 78%)",
        "fresh-lime": "hsl(82, 81%, 44%)",
        evergreen: "hsl(154, 42%, 30%)",
        "deep-burgundy": "hsl(345, 100%, 25%)",
        "golden-sand": "hsl(33, 57%, 62%)",
        "vanilla-latte": "hsl(39, 67%, 88%)",
        "teal-forest": "hsl(194, 47%, 34%)",

        // Extended color spectrum - All possible colors in HSL format
        // Reds (0-10 degrees)
        "red-pure": "hsl(0, 100%, 50%)",
        "red-bright": "hsl(0, 100%, 60%)",
        "red-light": "hsl(0, 100%, 70%)",
        "red-pastel": "hsl(0, 70%, 80%)",
        "red-dark": "hsl(0, 100%, 30%)",
        "red-deep": "hsl(0, 100%, 20%)",

        // Oranges (15-40 degrees)
        "orange-red": "hsl(15, 100%, 50%)",
        "orange-pure": "hsl(25, 100%, 50%)",
        "orange-bright": "hsl(30, 100%, 60%)",
        "orange-light": "hsl(35, 100%, 70%)",
        "orange-pastel": "hsl(30, 70%, 80%)",
        "orange-dark": "hsl(25, 100%, 35%)",
        "orange-deep": "hsl(25, 100%, 25%)",

        // Yellows (45-60 degrees)
        "yellow-orange": "hsl(45, 100%, 50%)",
        "yellow-pure": "hsl(55, 100%, 50%)",
        "yellow-bright": "hsl(55, 100%, 60%)",
        "yellow-light": "hsl(55, 100%, 70%)",
        "yellow-pastel": "hsl(55, 70%, 80%)",
        "yellow-dark": "hsl(55, 100%, 35%)",
        "yellow-deep": "hsl(55, 100%, 25%)",

        // Lime/Chartreuse (61-90 degrees)
        "lime-yellow": "hsl(65, 100%, 50%)",
        "lime-pure": "hsl(75, 100%, 50%)",
        "lime-bright": "hsl(85, 100%, 50%)",
        "lime-light": "hsl(80, 100%, 70%)",
        "lime-pastel": "hsl(80, 70%, 80%)",
        "lime-dark": "hsl(80, 100%, 35%)",
        "lime-deep": "hsl(80, 100%, 25%)",

        // Greens (91-150 degrees)
        "green-lime": "hsl(95, 100%, 45%)",
        "green-pure": "hsl(120, 100%, 40%)",
        "green-bright": "hsl(130, 100%, 50%)",
        "green-light": "hsl(120, 100%, 70%)",
        "green-pastel": "hsl(120, 70%, 80%)",
        "green-dark": "hsl(120, 100%, 25%)",
        "green-deep": "hsl(120, 100%, 15%)",
        "green-forest": "hsl(140, 80%, 30%)",

        // Teals/Aquas (151-195 degrees)
        "teal-green": "hsl(160, 100%, 40%)",
        "teal-pure": "hsl(175, 100%, 40%)",
        "teal-bright": "hsl(175, 100%, 50%)",
        "teal-light": "hsl(175, 100%, 70%)",
        "teal-pastel": "hsl(175, 70%, 80%)",
        "teal-dark": "hsl(175, 100%, 25%)",
        "teal-deep": "hsl(175, 100%, 15%)",

        // Cyans/Blues (196-225 degrees)
        "cyan-pure": "hsl(185, 100%, 50%)",
        "cyan-bright": "hsl(185, 100%, 60%)",
        "cyan-light": "hsl(185, 100%, 70%)",
        "cyan-pastel": "hsl(185, 70%, 80%)",
        "cyan-dark": "hsl(185, 100%, 30%)",
        "cyan-deep": "hsl(185, 100%, 20%)",
        "blue-sky": "hsl(200, 100%, 60%)",
        "blue-light": "hsl(210, 100%, 70%)",

        // Blues (226-255 degrees)
        "blue-pure": "hsl(240, 100%, 50%)",
        "blue-bright": "hsl(230, 100%, 60%)",
        "blue-royal": "hsl(235, 100%, 50%)",
        "blue-pastel": "hsl(230, 70%, 80%)",
        "blue-dark": "hsl(240, 100%, 30%)",
        "blue-deep": "hsl(240, 100%, 20%)",
        "blue-navy": "hsl(240, 80%, 20%)",

        // Purples/Indigos (256-285 degrees)
        "indigo-pure": "hsl(275, 100%, 40%)",
        "indigo-bright": "hsl(275, 100%, 50%)",
        "indigo-light": "hsl(275, 100%, 70%)",
        "indigo-pastel": "hsl(275, 70%, 80%)",
        "indigo-dark": "hsl(275, 100%, 30%)",
        "indigo-deep": "hsl(275, 100%, 20%)",

        // Purples/Violets (286-315 degrees)
        "purple-pure": "hsl(290, 100%, 40%)",
        "purple-bright": "hsl(290, 100%, 50%)",
        "purple-light": "hsl(290, 100%, 70%)",
        "purple-pastel": "hsl(290, 70%, 80%)",
        "purple-dark": "hsl(290, 100%, 30%)",
        "purple-deep": "hsl(290, 100%, 20%)",

        // Magentas/Pinks (316-345 degrees)
        "magenta-pure": "hsl(330, 100%, 50%)",
        "magenta-bright": "hsl(330, 100%, 60%)",
        "magenta-light": "hsl(330, 100%, 70%)",
        "magenta-pastel": "hsl(330, 70%, 80%)",
        "magenta-dark": "hsl(330, 100%, 30%)",
        "magenta-deep": "hsl(330, 100%, 20%)",
        "pink-hot": "hsl(335, 100%, 65%)",
        "pink-light": "hsl(335, 100%, 80%)",

        // Neutrals (grayscale)
        "white-pure": "hsl(0, 0%, 100%)",
        "gray-lightest": "hsl(0, 0%, 95%)",
        "gray-lighter": "hsl(0, 0%, 90%)",
        "gray-light": "hsl(0, 0%, 80%)",
        "gray-medium": "hsl(0, 0%, 60%)",
        "gray-dark": "hsl(0, 0%, 40%)",
        "gray-darker": "hsl(0, 0%, 20%)",
        "gray-darkest": "hsl(0, 0%, 10%)",
        "black-pure": "hsl(0, 0%, 0%)",

        // Special colors
        gold: "hsl(45, 100%, 50%)",
        silver: "hsl(0, 0%, 75%)",
        bronze: "hsl(30, 50%, 40%)",
        copper: "hsl(20, 70%, 40%)",
        "rose-gold": "hsl(350, 60%, 70%)",
        turquoise: "hsl(170, 100%, 40%)",
        emerald: "hsl(140, 100%, 30%)",
        ruby: "hsl(350, 100%, 35%)",
        sapphire: "hsl(220, 100%, 35%)",
        amethyst: "hsl(270, 100%, 40%)",
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
      ringOpacity: {
        DEFAULT: "0.5",
        0: "0",
        25: "0.25",
        50: "0.5",
        75: "0.75",
        100: "1",
      },
      ringWidth: {
        DEFAULT: "3px",
        0: "0px",
        1: "1px",
        2: "2px",
        4: "4px",
        8: "8px",
      },
    },
  },

  plugins: [
    require("daisyui"),
    require("@tailwindcss/forms"),
    require("@tailwindcss/typography"),
  ],

  // daisyUI config (optional - here are the default values)
  daisyui: {
    themes: ["light", "dark", "cupcake"],
    darkTheme: "dark", // name of one of the included themes for dark mode
    base: true, // applies background color and foreground color for root element by default
    styled: false, // include daisyUI colors and design decisions for all components
    utils: true, // adds responsive and modifier utility classes
    prefix: "", // prefix for daisyUI classnames (components, modifiers and responsive class names. Not colors)
    logs: true, // Shows info about daisyUI version and used config in the console when building your CSS
    themeRoot: ":root", // The element that receives theme color CSS variables
  },
};
