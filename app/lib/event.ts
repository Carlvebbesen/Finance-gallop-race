import {
  AssetType,
  TradeType,
  type SipsTakenPayload,
  type NewMarketDayPayload,
  type BetPlacedPayload,
  type BaseEvent,
  type CallOptionUsedPayload,
  type PutOptionPlayerPayload,
  type AssetChange,
  type GameEvent,
} from "~/types";

const sipsTaken = "sips_taken" as const;
const newMarketDay = "new_market_day" as const;
const put_option_player = "put_option_player" as const;
const bet_placed = "bet_placed" as const;
const game_state = "game_state" as const;
const player_joined = "player_joined" as const;
const call_option_used = "call_option_used" as const;

export const visibleUpdateEvents: readonly string[] = [
  sipsTaken,
  newMarketDay,
  put_option_player,
  bet_placed,
  player_joined,
  call_option_used,
] as const;

export {
  sipsTaken,
  newMarketDay,
  put_option_player,
  bet_placed,
  game_state,
  player_joined,
  call_option_used,
};

export const ASSET_LABELS: Record<AssetType, string> = {
  [AssetType.GOLD]: "Gold",
  [AssetType.BONDS]: "Bonds",
  [AssetType.STOCKS]: "Stocks",
  [AssetType.CRYPTO]: "Crypto",
};

export const ASSET_COLORS: Record<AssetType, string> = {
  [AssetType.GOLD]: "bg-yellow-500",
  [AssetType.BONDS]: "bg-blue-500",
  [AssetType.STOCKS]: "bg-purple-700",
  [AssetType.CRYPTO]: "bg-orange-500",
};
export enum GameStates {
  NOT_STARTED = "not_started",
  IN_PROGRESS = "in_progress",
  FINISHED = "finished",
}

export function generateEventText(event: GameEvent): string {
  switch (event.event) {
    case sipsTaken: {
      const payload = event.payload as SipsTakenPayload;
      return `Investor ${payload.nickname ?? payload.playerId} took ${
        payload.sipsCount
      } sip${payload.sipsCount === 1 ? "" : "s"}.`;
    }
    case newMarketDay: {
      const payload = event.payload as NewMarketDayPayload;
      const changesText = payload.changes
        .filter((asset) => asset.change !== 0)
        .map(
          (item) =>
            `${item.asset}: ${item.change > 0 ? "+" : ""}${item.change}%`
        )
        .join(", ");
      return `New market day! Changes: ${changesText}`;
    }

    case bet_placed: {
      const payload = event.payload as BetPlacedPayload;
      return `Investor ${payload.nickname ?? payload.playerId} placed a ${
        payload.type
      } bet  ${
        payload.type == TradeType.INVEST || payload.type == TradeType.SHORT
          ? `of ${payload.amount}`
          : ""
      } on ${payload.asset}.`;
    }
    case player_joined: {
      const payload = event.payload as BaseEvent;
      return `${payload.nickname ?? "Investor"} Joined the game! Lets Go`;
    }
    case call_option_used: {
      const payload = event.payload as CallOptionUsedPayload;
      return `${payload.nickname ?? "Investor"} ${
        payload.callOptionUsed ? "USED" : "DID NOT use"
      } his call option on ${payload.assetType}`;
    }

    case put_option_player: {
      const payload = event.payload as PutOptionPlayerPayload;
      return `Investor ${payload.nickname ?? payload.playerId} put a ${
        payload.assetType
      } option with ${payload.amount}.`;
    }

    default:
      return "Unknown event occurred.";
  }
}

function getDominantAssetColor(payload: { changes: AssetChange[] }): string {
  const highest = payload.changes.reduce((prev, curr) =>
    curr.change > prev.change ? curr : prev
  );

  return ASSET_COLORS[highest.asset];
}
export function generateEventColor(event: GameEvent): string {
  switch (event.event) {
    case sipsTaken: {
      return "bg-gradient-to-br from-amber-200 via-yellow-400 to-orange-600";
    }
    case newMarketDay: {
      const payload = event.payload as NewMarketDayPayload;
      return getDominantAssetColor(payload);
    }

    case bet_placed: {
      const payload = event.payload as BetPlacedPayload;
      if (payload.type === TradeType.INVEST) {
        return "bg-emerald-500";
      }
      if (payload.type === TradeType.SHORT) {
        return "bg-rose-300";
      }
      return "bg-blue-300";
    }
  }
  return "";
}
