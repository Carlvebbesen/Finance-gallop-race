import { create } from "zustand";
import type { Database } from "database.types";

export interface GameStore {
  game: Database["public"]["Tables"]["game"]["Row"] | null;
  setGame: (game: Database["public"]["Tables"]["game"]["Row"]) => void;
  player: Database["public"]["Tables"]["player"]["Row"] | null;
  setPlayer: (player: Database["public"]["Tables"]["player"]["Row"]) => void;
}

const useGameStore = create<GameStore>((set) => ({
  game: null,
  player: null,
  setGame: (game: Database["public"]["Tables"]["game"]["Row"]) => set({ game }),
  setPlayer: (player: Database["public"]["Tables"]["player"]["Row"]) =>
    set({ player }),
}));

export default useGameStore;
