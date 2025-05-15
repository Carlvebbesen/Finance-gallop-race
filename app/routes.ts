import {
  type RouteConfig,
  index,
  prefix,
  route,
} from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("signup", "routes/sign-up.tsx"),
  ...prefix("create", [route("game", "routes/create-game.tsx")]),
  ...prefix("join", [route("game", "routes/join-game.tsx")]),
  ...prefix("game/:gameId", [
    route("place/bets", "routes/betting-page.tsx"),
    route("player", "routes/player.tsx"),
    route("spectate", "routes/game.tsx"),
  ]),
] satisfies RouteConfig;
