import {
  type RouteConfig,
  index,
  prefix,
  route,
} from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("signup", "routes/sign-up.tsx"),
  ...prefix("create", [
    route("game", "routes/create-game.tsx"),
    route("player", "routes/create-player.tsx"),
  ]),
  ...prefix("auth", [
    route("error", "routes/auth.error.tsx"),
    route("oauth/*", "routes/auth.oath.tsx"),
  ]),
  ...prefix("join", [route("game", "routes/join-game.tsx")]),
  ...prefix("game/:gameId", [
    route("place/bets", "routes/betting-page.tsx"),
    route("player", "routes/player.client.tsx"),
    route("spectate", "routes/game.client.tsx"),
  ]),
] satisfies RouteConfig;
