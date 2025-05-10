import { useEffect, useState } from "react";
import { createClient } from "./supabase/client";
import type { RealtimePostgresUpdatePayload } from "@supabase/supabase-js";
import type { Game } from "~/routes/game.client";

export function useListenGameUpdates({
  gameId,
  callback,
}: {
  gameId: string;
  callback: () => void;
}) {
  const supabase = createClient();
  const [channel, setChannel] = useState<ReturnType<
    typeof supabase.channel
  > | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const newChannel = supabase.channel(`changes`);

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
          console.log(payload);
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
            console.log("STATUS");
            console.log(leading);
            console.log(
              updatedGame.call_percent && leading > updatedGame.call_percent
            );
            if (
              updatedGame.call_percent &&
              leading > updatedGame.call_percent
            ) {
              callback();
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
    };
  }, [gameId, supabase]);

  return { isConnected };
}
