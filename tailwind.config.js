module.exports = {
  theme: {
    extend: {
      animation: {
        drinkCelebrate: "celebrate 0.5s ease-out",
      },
      keyframes: {
        celebrate: {
          "0%": { backgroundColor: "#a7f3d0" }, // green-200
          "50%": { backgroundColor: "#86efac" }, // green-300
          "100%": { backgroundColor: "#f0fdf4" }, // green-50
        },
      },
    },
  },
};
