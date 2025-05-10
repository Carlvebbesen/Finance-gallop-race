import { create } from "zustand";
import type { Database } from "database.types";
import useGameStore from "./game-store";
import {
  calculateTotalSipsToDrink,
  calculateTotalSipsToHandOut,
} from "~/lib/utils";
import { TradeType } from "~/lib/eventTypes";
type Bet = Database["public"]["Tables"]["bets"]["Row"];

export interface BetStore {
  investBet: Bet | null;
  shortBet: Bet | null;
  putBet: Bet | null;
  callBet: Bet | null;
  setInvestBet: (bet: Bet) => void;
  setShortBet: (bet: Bet) => void;
  setPutBet: (bet: Bet) => void;
  setCallBet: (bet: Bet) => void;
  updateAllBets: (bets: Bet[]) => void;
  getTotalSipsToDrink: () => number;
  getTotalSipsToHandOut: () => number;
}

const useBetStore = create<BetStore>((set, get) => ({
  investBet: null,
  shortBet: null,
  putBet: null,
  callBet: null,
  updateAllBets: (bets: Bet[]) => {
    if (bets.length > 4) {
      console.error("You can only have 4 bets at a time");
    }
    bets.forEach((bet) => {
      if (bet.type === TradeType.INVEST) set({ investBet: bet });
      if (bet.type === TradeType.SHORT) set({ shortBet: bet });
      if (bet.type === TradeType.PUT) set({ putBet: bet });
      if (bet.type === TradeType.CALL) set({ callBet: bet });
    });
  },
  setInvestBet: (bet: Bet) => set({ investBet: bet }),
  setShortBet: (bet: Bet) => set({ shortBet: bet }),
  setPutBet: (bet: Bet) => set({ putBet: bet }),
  setCallBet: (bet: Bet) => set({ callBet: bet }),
  getTotalSipsToDrink: () => {
    const { investBet, shortBet, callBet, putBet } = get();
    const game = useGameStore.getState().game;
    const callAmount = game?.call_base_amount ?? 0;
    const putAmount = game?.put_base_amount ?? 0;
    return calculateTotalSipsToDrink(
      investBet,
      shortBet,
      callBet,
      putBet,
      callAmount,
      putAmount
    );
  },
  getTotalSipsToHandOut: () => {
    const { shortBet, investBet } = get();
    const game = useGameStore.getState().game;
    const shortMultiplier = game?.short_multiplier ?? 0;
    const investMultiplier = game?.invest_multiplier ?? 0;
    return calculateTotalSipsToHandOut(
      shortBet,
      investBet,
      shortMultiplier,
      investMultiplier
    );
  },
}));

export default useBetStore;
