import {
  generateEventColor,
  generateEventText,
  type Event,
} from "~/lib/eventTypes";
import { ScrollArea } from "../ui/scroll-area";
import { Button } from "../ui/button";
import { Link } from "react-router";

export default function MarketEvents({ events }: { events: Event[] }) {
  return (
    <div className="h-full flex flex-col p-2">
      <div className="flex justify-between">
        <h2 className="text-xl font-bold mb-2">Market Events</h2>
        <Button>
          <Link to={"/"}>Exit Market</Link>
        </Button>
      </div>
      <ScrollArea className="flex-1 border rounded-md p-1">
        <div className="space-y-2">
          {events.map((event) => (
            <div
              key={`${event.payload.datetime}-${event.payload.playerId}`}
              className={`border-b p-2 ${generateEventColor(
                event
              )} rounded-2xl`}
            >
              <p className="font-medium">{generateEventText(event)}</p>
              <p className="text-xs text-gray-500">
                {new Date(event.payload.datetime).toLocaleTimeString()}
              </p>
            </div>
          ))}
          {events.length === 0 && (
            <p className="text-gray-500 italic">No market events yet</p>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
