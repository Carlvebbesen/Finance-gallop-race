import { useEffect, useState } from "react";
import { createClient } from "./supabase/client";
import type { GameEvent } from "~/types";
import { new_game, visibleUpdateEvents } from "./event";
import { useNavigate } from "react-router";

// Define a type for the callback function for clarity
type EventCallback = (event: GameEvent) => void;

export function useRealtimeGame({
  gameId,
  onNewEvent, // New callback prop
}: {
  gameId: string;
  onNewEvent?: EventCallback; // Make it optional if not always needed
}) {
  const supabase = createClient();
  const [events, setEvents] = useState<GameEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  const navigate = useNavigate();
  useEffect(() => {
    if (!gameId) {
      // Or handle this scenario appropriately, e.g., by not attempting to subscribe
      console.warn("useRealtimeGame: gameId is not provided.");
      return;
    }

    const newChannel = supabase.channel(`game-${gameId}`);

    newChannel
      .on("broadcast", { event: "*" }, (payload) => {
        const newEvent = payload as GameEvent;
        if (visibleUpdateEvents.includes(newEvent.event)) {
          setEvents((currentEvents) => [newEvent, ...currentEvents]);
        }
        if (newEvent.event == new_game) {
          const newId = newEvent.payload.newGameId;
          navigate(`/game/${newId}/spectate`);
        }

        if (onNewEvent) {
          try {
            onNewEvent(newEvent);
          } catch (error) {
            console.error("Error executing onNewEvent callback:", error);
          }
        }
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          setIsConnected(true);
          console.log(`Successfully subscribed to channel: game-${gameId}`);
        } else {
          setIsConnected(false);
          console.log(`Subscription status for game-${gameId}: ${status}`);
          if (status === "CHANNEL_ERROR") {
            console.error(`Channel error for game-${gameId}.`);
          }
        }
      });

    return () => {
      console.log(`Cleaning up channel: game-${gameId}`);
      supabase.removeChannel(newChannel).catch((error) => {
        console.error(`Error removing channel game-${gameId}:`, error);
      });
      setIsConnected(false);
    };
  }, [gameId, supabase, onNewEvent]);

  return { events, isConnected };
}
