import { useEffect, useRef, useState } from "react";
import { createClient } from "./supabase/client";
import type { Bet, Game, GameEvent, newGamePayload } from "~/types";
import { GameStates, new_game } from "./event";
import { useNavigate } from "react-router";

export function useListenGameUpdates({
  gameId,
  callback,
  gameFinished,
  callOptionUsed,
  callBet,
}: {
  gameId: string;
  callOptionUsed: boolean | null;
  callBet?: Bet;
  callback: () => void;
  gameFinished: React.Dispatch<React.SetStateAction<Game>>;
}) {
  const supabase = createClient();
  const [channel, setChannel] = useState<ReturnType<
    typeof supabase.channel
  > | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const callbackRef = useRef(callback);
  const callOptionUsedRef = useRef(callOptionUsed);
  const callBetRef = useRef(callBet);

  useEffect(() => {
    callbackRef.current = callback;
    callOptionUsedRef.current = callOptionUsed;
    callBetRef.current = callBet;
  }, [callback, callOptionUsed, callBet]);

  useEffect(() => {
    const newChannel = supabase.channel(`changes`);
    const gameChannel = supabase.channel(`game-${gameId}`);
    gameChannel.on("broadcast", { event: new_game }, (payload) => {
      const newEvent = payload as GameEvent;
      if (newEvent.event === new_game) {
        const newId = newEvent.payload.newGameId;
        if (newId) {
          window.location.href = `/join/game?newGameId=${newId}`;
        }
      }
    });
    newChannel
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "game",
          filter: `game_id=eq.${gameId}`,
        },
        (payload) => {
          const updatedGame = payload.new as Game | null;

          if (updatedGame) {
            const leading = Math.max(
              ...[
                updatedGame.bonds_pos ?? 0,
                updatedGame.gold_pos ?? 0,
                updatedGame.crypto_pos ?? 0,
                updatedGame.stocks_pos ?? 0,
              ]
            );
            if (
              updatedGame.call_percent &&
              leading > updatedGame.call_percent &&
              callOptionUsedRef.current === null &&
              callBetRef.current?.asset != null
            ) {
              callbackRef.current();
            }
            if (updatedGame.state === GameStates.FINISHED) {
              gameFinished(updatedGame);
            }
          }
        }
      )
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          setIsConnected(true);
        }
      });
    setChannel(newChannel);

    return () => {
      supabase.removeChannel(newChannel);
      supabase.removeChannel(gameChannel);
    };
  }, [gameId, supabase]);

  return { isConnected };
}
