import type { Database } from "database.types";
import type {
  bet_placed,
  call_option_used,
  game_state,
  new_game,
  newMarketDay,
  player_joined,
  put_option_player,
  sipsTaken,
} from "./lib/event";

export interface AssetStateValue {
  asset: AssetType;
  position: number;
  lastChange: number;
  currentTrendSum: number;
}

export type currentAssets = Record<AssetType, AssetStateValue>;

export type Bet = Database["public"]["Tables"]["bets"]["Row"];
export type InsertBet = Database["public"]["Tables"]["bets"]["Insert"];

export type Game = Database["public"]["Tables"]["game"]["Row"];

export type Investor = Database["public"]["Tables"]["player_in_game"]["Row"];

// Either define the valueAll or add the changes prop
export type MarketEventCard = {
  id: string;
  position: number;
  type: MarketEventType;
  isFlipped: boolean;
  valueAll: number;
  changes: AssetChange[];
  text: string;
};

export interface BaseEvent {
  playerId: string;
  gameId: string;
  datetime: string;
  nickname?: string;
}

export interface SipsTakenPayload extends BaseEvent {
  sipsCount: number;
}

export interface AssetChange {
  asset: AssetType;
  change: number;
}

export interface NewMarketDayPayload extends BaseEvent {
  changes: AssetChange[];
}

export interface BetPlacedPayload extends BaseEvent {
  asset: string;
  amount: number;
  type: string;
  put_option_player?: string | null;
}
export interface GameStatePayload extends BaseEvent {
  nextState: string;
}

export interface PutOptionPlayerPayload extends BaseEvent {
  assetType: string;
  amount: number;
}
export interface CallOptionUsedPayload extends BaseEvent {
  assetType: string;
  callOptionUsed: boolean;
}
export interface newGamePayload extends BaseEvent {
  newGameId: string;
}

export type GameEvent =
  | { type: "broadcast"; event: typeof sipsTaken; payload: SipsTakenPayload }
  | { type: "broadcast"; event: typeof new_game; payload: newGamePayload }
  | {
      type: "broadcast";
      event: typeof newMarketDay;
      payload: NewMarketDayPayload;
    }
  | { type: "broadcast"; event: typeof bet_placed; payload: BetPlacedPayload }
  | {
      type: "broadcast";
      event: typeof call_option_used;
      payload: CallOptionUsedPayload;
    }
  | { type: "broadcast"; event: typeof game_state; payload: GameStatePayload }
  | { type: "broadcast"; event: typeof player_joined; payload: BaseEvent }
  | {
      type: "broadcast";
      event: typeof put_option_player;
      payload: PutOptionPlayerPayload;
    };

export enum TradeType {
  INVEST = "invest",
  SHORT = "short",
  PUT = "put",
  CALL = "call",
}

export enum AssetType {
  GOLD = "gold",
  CRYPTO = "crypto",
  STOCKS = "stocks",
  BONDS = "bonds",
}
export enum MarketEventType {
  BULL = "bull",
  BEAR = "bear",
  BOOM = "boom",
}

export interface GameSettings {
  rounds: number;
  shortMultiplier: number;
  investMultiplier: number;
  callPercent: number;
  putPercent: number;
  callBaseAmount: number;
  putBaseAmount: number;
}

// Input type for player-specific state, especially for call options
export interface PlayerState {
  player_id: string; // Player ID
  call_option_used: boolean;
  call_option_asset?: AssetType; // The asset the player switched their investments to if call_option_used is true
}

// Input type for game rules (multipliers)
export interface GameRules {
  invest_multiplier: number;
  short_multiplier: number;
}

// Output structure for successful investments
export interface SuccessfulInvestmentInfo {
  player: string;
  asset: AssetType; // The effective asset invested in (could be call option asset)
  originalInvestedAmount: number; // Sum of original bet amounts if call option, else individual bet amount
  sipsToDeal: number;
  callOptionUsed: boolean; // True if the player used a call option
  isEffectiveCallOptionInvestment: boolean; // True if this specific entry is the result of a call option strategy
}

// Output structure for successful shorts
export interface SuccessfulShortInfo {
  player: string;
  asset: AssetType; // The asset that was shorted
  amount: number; // The amount shorted
  sipsToDeal: number;
}

// Output structure for unsuccessful shorts
export interface UnsuccessfulShortInfo {
  player: string;
  asset: AssetType; // The asset that was shorted (and won)
  amount: number; // The amount shorted
  sipsToDrink: number;
}

// Output structure for player summary
export interface PlayerSipSummary {
  player: string;
  sipsToDealOut: number;
  sipsToDrink: number;
}

// Overall result structure for the calculation function
export interface SipCalculationResult {
  winningAssets: AssetType[];
  losingAssets: AssetType[]; // Assets that were present in marketPerformance but did not win
  successfulInvestments: SuccessfulInvestmentInfo[];
  successfulShorts: SuccessfulShortInfo[];
  unsuccessfulShorts: UnsuccessfulShortInfo[];
  playerSipSummary: PlayerSipSummary[];
}
