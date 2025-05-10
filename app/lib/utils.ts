import { clsx, type ClassValue } from "clsx";
import type { Database } from "database.types";
import { twMerge } from "tailwind-merge";
import {
  AssetType,
  MarketEventType,
  TradeType,
  type AssetChange,
  type MarketEventCard,
} from "./eventTypes";
import type { AssetStateValue, Game } from "~/routes/game.client";
import {
  bullTextsValueAll,
  bearTextsValueAll,
  boomTextsPositiveValueAll,
  boomTextsNegativeValueAll,
  assetSpecificTexts,
} from "./marketEventTexts";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateNextMarketRound(maxGain: number): AssetChange[] {
  const assets: AssetType[] = [
    AssetType.GOLD,
    AssetType.BONDS,
    AssetType.STOCKS,
    AssetType.CRYPTO,
  ];

  const result: Record<AssetType, number> = {
    [AssetType.GOLD]: 0,
    [AssetType.BONDS]: 0,
    [AssetType.STOCKS]: 0,
    [AssetType.CRYPTO]: 0,
  };

  // Shuffle helper
  function shuffle<T>(array: T[]): T[] {
    return array.sort(() => Math.random() - 0.5);
  }

  // Pick 3 unique assets
  const shuffled = shuffle([...assets]);
  const lossAsset = shuffled[0];
  const optionalGainAsset = shuffled[1];
  const guaranteedGainAsset = shuffled[2];

  // Guaranteed gain: between 0.5x and 1.0x maxGain
  result[guaranteedGainAsset] = randomInRange(0.5 * maxGain, maxGain);

  // 70% chance for a loss asset
  if (Math.random() < 0.4) {
    result[lossAsset] = -randomInRange(0.2 * maxGain, 0.6 * maxGain);
  }

  // 40% chance for a medium gain asset
  if (Math.random() < 0.4) {
    result[optionalGainAsset] = randomInRange(0.3 * maxGain, 0.8 * maxGain);
  }

  // Convert to AssetChange[]
  return Object.entries(result).map(([asset, change]) => ({
    asset: asset as AssetType,
    change: parseInt(change.toFixed(1)),
  }));
}

// Helper to generate random number in range [min, max]
function randomInRange(min: number, max: number): number {
  return +(Math.random() * (max - min) + min).toFixed(2);
}

export function generateGameId(length = 6): string {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
  let result = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters.charAt(randomIndex);
  }

  return result;
}

export function parseAssetType(value: string): AssetType | undefined {
  const normalized = value.toLowerCase();
  if (Object.values(AssetType).includes(normalized as AssetType)) {
    return normalized as AssetType;
  }
  return undefined;
}

type Bet = Database["public"]["Tables"]["bets"]["Row"];

export function calculateTotalSipsToDrink(
  investBet: Bet | null,
  shortBet: Bet | null,
  callBet: Bet | null,
  putBet: Bet | null,
  callAmount: number,
  putAmount: number
): number {
  return (
    (investBet?.amount ?? 0) +
    (shortBet?.amount ?? 0) +
    (callBet?.amount ? callAmount : 0) +
    (putBet?.amount ? putAmount : 0)
  );
}

export const totalSipsToDrink = (game: Game, bets: Bet[]) =>
  bets.reduce((total, bet) => {
    if (bet.type === TradeType.INVEST) {
      return total + bet.amount;
    } else if (bet.type === TradeType.SHORT) {
      return total + bet.amount;
    } else if (bet.type === TradeType.PUT) {
      return total + game.put_base_amount;
    } else if (bet.type === TradeType.CALL) {
      return total + game.call_base_amount;
    }
    return total;
  }, 0);

export function calculateTotalSipsToHandOut(
  shortBet: Bet | null,
  investBet: Bet | null,
  shortMultiplier: number,
  investMultiplier: number
): number {
  return (
    (shortBet?.amount ? shortMultiplier * shortBet.amount : 0) +
    (investBet?.amount ? investMultiplier * investBet.amount : 0)
  );
}

export function calculateNewTrend(trend: number, change: number): number {
  if (change === 0 || (change < 0 && trend > 0) || (change > 0 && trend < 0)) {
    return change;
  } else {
    return trend + change;
  }
}

export function getLeadingAsset(assets: AssetStateValue[]) {
  return assets.reduce((prev, curr) =>
    curr.position > prev.position ? curr : prev
  );
}

// --- Helper Functions ---

// Helper for random integer in range [min, max] (inclusive)
function getRandomInt(min: number, max: number): number {
  // If max < min (e.g., maxValue is 0, and we call getRandomInt(1, 0)),
  // this ensures a minimal effect if intended (e.g. returns min, so 1).
  // If strictly no change is desired when max < min, this could return 0 or throw.
  if (min > max && min === 1 && max === 0) return 1; // Specific case for getRandomInt(1,0) to return 1
  if (min > max) return min; // General case if min > max
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Helper to pick a random element from an array
function getRandomElement<T>(arr: T[]): T {
  if (arr.length === 0) {
    // Fallback if somehow an empty text array is passed, though this shouldn't happen with current setup
    return "A mysterious silence fills the market..." as T;
  }
  return arr[Math.floor(Math.random() * arr.length)];
}

const ALL_ASSETS_TYPES: AssetType[] = [
  AssetType.GOLD,
  AssetType.CRYPTO,
  AssetType.STOCKS,
  AssetType.BONDS,
];

export function generateMarketEvents(
  n: number,
  maxValue: number // For regular events, this caps the absolute change.
): MarketEventCard[] {
  const events: MarketEventCard[] = [];
  let localEventIdCounter = 0; // For unique IDs within this batch

  // Ensure maxValue is at least 0 for calculations, though 1+ is more practical for changes.
  const saneMaxValue = Math.max(0, maxValue);

  const minBoardPosition = 7;
  // The term (maxValue + 1) in board positioning is from the prompt.
  // It means higher maxValue reduces the available track.
  const maxBoardPosition = 100 - (saneMaxValue + 1);

  if (n <= 0) {
    return [];
  }
  if (minBoardPosition > maxBoardPosition) {
    console.warn(
      `Cannot place events: minBoardPosition (${minBoardPosition}) > maxBoardPosition (${maxBoardPosition}). This might be due to a very high maxValue. No events generated.`
    );
    return [];
  }

  // Validate if it's possible to place n events with a minimum gap of 11
  // Each event takes 1 spot, (n-1) gaps take (n-1)*4 spots if gap is 11 (meaning pos[i+1] = pos[i]+11)
  // Total spots needed = 1 (first event) + (n-1)*11 (for subsequent events starting 11 positions away)
  // Max position for first event = minBoardPosition. Last event = minBoardPosition + (n-1)*11
  // So, minBoardPosition + (n-1)*11 must be <= maxBoardPosition
  if (minBoardPosition + (n - 1) * 11 > maxBoardPosition && n > 0) {
    const possibleN =
      Math.floor((maxBoardPosition - minBoardPosition) / 11) + 1;
    if (possibleN <= 0) {
      console.warn(
        `Cannot place any events with the given constraints. (maxBoardPosition: ${maxBoardPosition}, minBoardPosition: ${minBoardPosition}). No events generated.`
      );
      return [];
    }
    console.warn(
      `Cannot place ${n} events with the given constraints. Reducing to ${possibleN} events.`
    );
    n = possibleN;
  }

  let lastPosition = 0; // Stores the position of the previously placed event
  let trumpEventAdded = false;
  const trumpEventChance = 0.05; // 5%

  for (let i = 0; i < n; i++) {
    localEventIdCounter++;
    const id = `event-${localEventIdCounter}`;
    let currentPosition: number;

    if (i === 0) {
      // Max start position for the first event, ensuring space for subsequent n-1 events
      const maxStartPos = maxBoardPosition - (n - 1) * 11;
      currentPosition = getRandomInt(
        minBoardPosition,
        Math.max(minBoardPosition, maxStartPos)
      );
    } else {
      const minNextPos = lastPosition + 11;
      // Max start position for the current event, ensuring space for remaining (n-1-i) events
      const maxNextPos = maxBoardPosition - (n - 1 - i) * 11;
      if (minNextPos > maxNextPos) {
        // Should be caught by initial N validation, but as a safeguard:
        console.error(
          "Error in position calculation: Cannot find valid position. Stopping event generation."
        );
        break;
      }
      currentPosition = getRandomInt(minNextPos, maxNextPos);
    }
    lastPosition = currentPosition;

    let type: MarketEventType;
    let valueAll = 0;
    let changes: AssetChange[] = [];
    let text = "";

    // Special "Trump Tax Laws" event (5% chance), only happens once
    if (!trumpEventAdded && Math.random() < trumpEventChance && n > 0) {
      // Ensure n>0 for safety
      type = MarketEventType.BEAR; // Definitely a BEAR market for this one, or BOOM for significance
      valueAll = -0.4; // Represents a 40% reduction
      changes = []; // valueAll is used, so changes is empty
      text =
        "Yuge News! Ex-President Trump unveils 'America First, Wallet Last' tax plan from his golf course! All assets take a 40% haircut to fund... more golf courses?";
      trumpEventAdded = true;
    } else {
      // Regular event generation
      const eventTypeRoll = Math.random();
      if (eventTypeRoll < 0.35) type = MarketEventType.BULL; // 35%
      else if (eventTypeRoll < 0.8) type = MarketEventType.BEAR; // 40%
      else type = MarketEventType.BOOM; // 20%

      const useValueAll = Math.random() < 0.4; // 40% chance to use valueAll for broad effect

      if (useValueAll) {
        changes = []; // Ensure changes is empty if valueAll is used
        let absChange = getRandomInt(1, saneMaxValue === 0 ? 1 : saneMaxValue); // Min change of 1 if maxValue is 0

        if (type === MarketEventType.BULL) {
          valueAll = absChange;
          text = getRandomElement(bullTextsValueAll);
        } else if (type === MarketEventType.BEAR) {
          valueAll = -absChange;
          text = getRandomElement(bearTextsValueAll);
        } else {
          // BOOM event affecting all assets
          // BOOM events are more impactful
          absChange = getRandomInt(
            Math.max(1, Math.floor(saneMaxValue * 0.45)),
            saneMaxValue === 0 ? 2 : saneMaxValue
          );
          if (Math.random() < 0.4) {
            // 40% chance of positive BOOM
            valueAll = absChange;
            text = getRandomElement(boomTextsPositiveValueAll);
          } else {
            valueAll = -absChange;
            text = getRandomElement(boomTextsNegativeValueAll);
          }
        }
      } else {
        // Use specific asset changes
        valueAll = 0; // Ensure valueAll is 0 if changes is used
        const numAssetsToChange = getRandomInt(1, ALL_ASSETS_TYPES.length);
        // Shuffle available assets and pick a few
        const assetsToAffect = [...ALL_ASSETS_TYPES]
          .sort(() => 0.5 - Math.random())
          .slice(0, numAssetsToChange);
        let combinedTextParts: string[] = [];

        for (const asset of assetsToAffect) {
          let changeAmount = getRandomInt(
            1,
            saneMaxValue === 0 ? 1 : saneMaxValue
          );
          let assetText = "";

          if (type === MarketEventType.BULL) {
            // changeAmount is already positive
            assetText = getRandomElement(assetSpecificTexts[asset].bull);
          } else if (type === MarketEventType.BEAR) {
            changeAmount = -changeAmount; // Make it negative
            assetText = getRandomElement(assetSpecificTexts[asset].bear);
          } else {
            // BOOM event affecting specific assets
            changeAmount = getRandomInt(
              Math.max(1, Math.floor(saneMaxValue * 0.45)),
              saneMaxValue === 0 ? 2 : saneMaxValue
            );
            if (Math.random() < 0.4) {
              // 40% positive
              assetText = getRandomElement(
                assetSpecificTexts[asset].boomPositive
              );
            } else {
              changeAmount = -changeAmount;
              assetText = getRandomElement(
                assetSpecificTexts[asset].boomNegative
              );
            }
          }
          changes.push({ asset, change: changeAmount });
          combinedTextParts.push(`${asset.toUpperCase()}: ${assetText}`);
        }
        text = combinedTextParts.join("MEANWHILE... ");
        if (changes.length === 0) {
          // Fallback if somehow no assets were selected (should not happen)
          valueAll = getRandomInt(
            1,
            Math.max(1, Math.floor(saneMaxValue * 0.1))
          ); // Small positive effect
          text =
            "A tiny market gremlin nudged a few numbers almost imperceptibly. Minor universal uptick!";
          type = MarketEventType.BULL;
        }
      }
    }

    events.push({
      id,
      position: currentPosition,
      type,
      isFlipped: false, // Default to not flipped
      valueAll,
      changes,
      text,
    });
  }

  return events;
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

/**
 * Calculates sips to take and deal out for players in a finance game.
 * @param bets Array of all bets made by players.
 * @param players Array of player states, including call option details.
 * @param marketPerformance A record of asset types to their final performance value (e.g., price).
 * @param gameRules Object containing investment and short multipliers.
 * @returns SipCalculationResult object.
 */
export function calculateSips(
  bets: Bet[],
  players: PlayerState[],
  marketPerformance: Record<AssetType, number>,
  gameRules: GameRules
): SipCalculationResult {
  const result: SipCalculationResult = {
    winningAssets: [],
    losingAssets: [],
    successfulInvestments: [],
    successfulShorts: [],
    unsuccessfulShorts: [],
    playerSipSummary: [],
  };

  const playerSummaries: Record<
    string,
    { sipsToDealOut: number; sipsToDrink: number }
  > = {};

  // --- 1. Determine Winning and Losing Assets ---
  let maxPerformance = -Infinity;
  const allMarketAssets = Object.keys(marketPerformance) as AssetType[];

  if (allMarketAssets.length === 0) {
    // No market data, so no winners or losers, and no sips from market events
    // Initialize player summaries for all players who made bets
    const uniquePlayerIdsInBets = Array.from(
      new Set(bets.map((b) => b.player))
    );
    uniquePlayerIdsInBets.forEach((playerId) => {
      if (!playerSummaries[playerId]) {
        playerSummaries[playerId] = { sipsToDealOut: 0, sipsToDrink: 0 };
      }
    });
    result.playerSipSummary = Object.entries(playerSummaries).map(
      ([player, summary]) => ({
        player,
        ...summary,
      })
    );
    return result;
  }

  for (const asset of allMarketAssets) {
    if (marketPerformance[asset] > maxPerformance) {
      maxPerformance = marketPerformance[asset];
    }
  }

  for (const asset of allMarketAssets) {
    if (marketPerformance[asset] === maxPerformance) {
      result.winningAssets.push(asset);
    } else {
      result.losingAssets.push(asset);
    }
  }
  // If all assets performed equally (e.g., all 0, or only one asset), all are winners.
  // The above logic handles this: if all have same maxPerformance, all are pushed to winningAssets.
  // losingAssets will be empty in such a case if all assets are winners.

  // --- 2. Process Bets for Each Player ---
  const playerMap = new Map(players.map((p) => [p.player_id, p]));
  const uniquePlayerIds = Array.from(new Set(bets.map((b) => b.player)));

  uniquePlayerIds.forEach((playerId) => {
    playerSummaries[playerId] = { sipsToDealOut: 0, sipsToDrink: 0 };
    const playerState = playerMap.get(playerId);
    const playerBets = bets.filter((b) => b.player === playerId);

    // --- Handle Investments ---
    if (playerState?.call_option_used && playerState.call_option_asset) {
      // Player used a call option: all their investments are now on the call_option_asset
      let totalInvestedAmount = 0;
      playerBets.forEach((bet) => {
        if (bet.type.toLowerCase() === "invest") {
          totalInvestedAmount += bet.amount;
        }
      });

      if (totalInvestedAmount > 0) {
        const effectiveAsset = playerState.call_option_asset;
        if (result.winningAssets.includes(effectiveAsset)) {
          const sipsToDeal = totalInvestedAmount * gameRules.invest_multiplier;
          result.successfulInvestments.push({
            player: playerId,
            asset: effectiveAsset,
            originalInvestedAmount: totalInvestedAmount,
            sipsToDeal,
            callOptionUsed: true,
            isEffectiveCallOptionInvestment: true,
          });
          playerSummaries[playerId].sipsToDealOut += sipsToDeal;
        }
      }
    } else {
      // Player did not use a call option (or it wasn't valid), process individual investment bets
      playerBets.forEach((bet) => {
        if (bet.type.toLowerCase() === "invest") {
          const investedAsset = bet.asset as AssetType; // Assuming bet.asset is a valid AssetType string
          if (Object.values(AssetType).includes(investedAsset)) {
            // Basic validation
            if (result.winningAssets.includes(investedAsset)) {
              const sipsToDeal = bet.amount * gameRules.invest_multiplier;
              result.successfulInvestments.push({
                player: playerId,
                asset: investedAsset,
                originalInvestedAmount: bet.amount,
                sipsToDeal,
                callOptionUsed: playerState?.call_option_used || false,
                isEffectiveCallOptionInvestment: false,
              });
              playerSummaries[playerId].sipsToDealOut += sipsToDeal;
            }
          } else {
            console.warn(
              `Bet with invalid asset type string: ${bet.asset} for player ${playerId}`
            );
          }
        }
      });
    }

    // --- Handle Shorts ---
    playerBets.forEach((bet) => {
      if (bet.type.toLowerCase() === "short") {
        const shortedAsset = bet.asset as AssetType; // Assuming bet.asset is a valid AssetType string
        if (Object.values(AssetType).includes(shortedAsset)) {
          // Basic validation
          if (result.winningAssets.includes(shortedAsset)) {
            // Shorted a winning asset: player drinks
            const sipsToDrink = bet.amount;
            result.unsuccessfulShorts.push({
              player: playerId,
              asset: shortedAsset,
              amount: bet.amount,
              sipsToDrink,
            });
            playerSummaries[playerId].sipsToDrink += sipsToDrink;
          } else if (
            result.losingAssets.includes(shortedAsset) ||
            !allMarketAssets.includes(shortedAsset)
          ) {
            // Shorted a losing asset (or an asset not in market, effectively a "loss" for the asset holder): player deals sips
            // If an asset is not in marketPerformance at all, it can be considered as having "lost" for shorting purposes.
            const sipsToDeal = bet.amount * gameRules.short_multiplier;
            result.successfulShorts.push({
              player: playerId,
              asset: shortedAsset,
              amount: bet.amount,
              sipsToDeal,
            });
            playerSummaries[playerId].sipsToDealOut += sipsToDeal;
          }
        } else {
          console.warn(
            `Short bet with invalid asset type string: ${bet.asset} for player ${playerId}`
          );
        }
      }
    });
  });

  result.playerSipSummary = Object.entries(playerSummaries).map(
    ([player, summary]) => ({
      player,
      ...summary,
    })
  );

  return result;
}
