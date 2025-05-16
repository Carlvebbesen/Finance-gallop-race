import { useEffect, useState } from "react";
import { createClient } from "./supabase/client";
import type { Game, GameEvent, newGamePayload } from "~/types";
import { GameStates, new_game } from "./event";
import { useNavigate } from "react-router";

export function useListenGameUpdates({
  gameId,
  callback,
  gameFinished,
}: {
  gameId: string;
  callback: () => void;
  gameFinished: React.Dispatch<React.SetStateAction<Game>>;
}) {
  const supabase = createClient();
  const [channel, setChannel] = useState<ReturnType<
    typeof supabase.channel
  > | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    const newChannel = supabase.channel(`changes`);
    const gameChannel = supabase.channel(`game-${gameId}`);
    gameChannel.on("broadcast", { event: new_game }, (payload) => {
      const newEvent = payload as GameEvent;
      if (newEvent.event == new_game) {
        const newId = newEvent.payload.newGameId;
        navigate(`/join?newGameId=${newId}`);
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
              leading > updatedGame.call_percent
            ) {
              callback();
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
