module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./screens/*.{js,jsx,ts,tsx}",
    "./index.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./LoginScreen.{js,jsx,ts,tsx}",
    "./SignUpScreen.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    gradientColorStops: theme => ({
     ...theme('colors'),
     'primary': '#3490dc',
     'secondary': '#ffed4a',
     'danger': '#e3342f',
    })
  },
  plugins: [],
};
