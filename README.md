# Veddeløpet-Inspired Investment Game 🏁

Welcome to a fast-paced single-page application (SPA) built with React Router that brings together strategy, chance, and a bit of fun! This game is inspired by the Norwegian game _Veddeløpet_ and puts a unique spin on investing, gambling, and social drinking.

## 🎯 Objective

The goal is simple: Be the first player whose chosen asset reaches a **100% market gain**.

## 💸 Assets to Bet On

Choose your champion from a selection of volatile assets. Each round, these assets will increase by a random percentage gain. The race is on!

- 📈 **Stocks**
- 🪙 **Crypto**
- 🥇 **Gold**
- 💼 **Bonds**

## 🧠 How to Play

Players have several ways to engage with the market and outsmart their opponents:

- **Invest (Standard Bet):**

  - Bet _on_ an asset to win.
  - _If your chosen asset is the first to reach 100% gain, other players drink. If another asset wins, you drink._

- **Short an Asset:**

  - Bet _against_ an asset, predicting it will perform poorly.
  - _If the asset you shorted finishes last (has the lowest gain when a winner is declared), other players drink. However, if the asset you shorted ends up winning the game, you drink!_

- **Put Option (Costs 7 sips):**

  - Drink 7 sips to activate this option.
  - This allows you to:
    - Bet against another player's chosen asset.
    - Gain the option to force another player to switch their asset with one of your choosing halfway through the game.

- **Call Option (Costs 7 sips):**
  - Drink 7 sips to activate this option.
  - This allows you to:
    - Pre-select a second asset for yourself at the start.
    - Switch to this second pre-selected asset halfway through the game.
    - You keep your original sips count if you switch.

## 🔁 Game Flow

The game progresses in rounds, with each round simulating investment growth for all assets. The first asset to hit the **100% gain** target wins the game for its investor!

**But be warned!** If an asset experiences unusually rapid growth, it might come under scrutiny, potentially leading to a loss of returns. Manage your investments wisely!

---

Let the sips and the stocks flow 🍻📊
Make your bets, hedge your risks — and may the best (or luckiest) investor win!

---

**Note:** This project is a Single Page Application (SPA) built using React and utilizes React Router for navigation.
