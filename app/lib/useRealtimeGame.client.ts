import { useEffect, useState } from "react"; // Import useCallback
import { createClient } from "./supabase/client"; // Ensure this path is correct
import { visibleUpdateEvents, type Event } from "./eventTypes"; // Ensure this path and type are correct

// Define a type for the callback function for clarity
type EventCallback = (event: Event) => void;

export function useRealtimeGame({
  gameId,
  onNewEvent, // New callback prop
}: {
  gameId: string;
  onNewEvent?: EventCallback; // Make it optional if not always needed
}) {
  const supabase = createClient();
  const [events, setEvents] = useState<Event[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  useEffect(() => {
    if (!gameId) {
      // Or handle this scenario appropriately, e.g., by not attempting to subscribe
      console.warn("useRealtimeGame: gameId is not provided.");
      return;
    }

    const newChannel = supabase.channel(`game-${gameId}`);

    newChannel
      .on("broadcast", { event: "*" }, (payload) => {
        const newEvent = payload as Event;
        if (visibleUpdateEvents.includes(newEvent.event)) {
          setEvents((currentEvents) => [newEvent, ...currentEvents]);
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
