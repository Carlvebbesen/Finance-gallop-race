import { useEffect } from "react";
import { toast } from "sonner";
import useBetStore from "~/stores/bet-store";
import { useFetcher } from "react-router";
import type { Database } from "database.types";
import type { action } from "~/routes/betting-page";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { TradeType } from "~/lib/eventTypes";

interface Props {
  game: Database["public"]["Tables"]["game"]["Row"];
}

export default function ShortCard({ game }: Props) {
  const fetcher = useFetcher<typeof action>();
  const shortBet = useBetStore((state) => state.shortBet);
  const addShortBet = useBetStore((state) => state.setShortBet);

  const isSubmitting = fetcher.state === "submitting";

  useEffect(() => {
    if (fetcher.data?.error) {
      toast.error("Could not place short bet", {
        description: fetcher.data.error,
      });
    }

    if (fetcher.data?.success) {
      console.log("fetcher.data.bet", fetcher.data.bet);
      addShortBet(
        fetcher.data.bet as Database["public"]["Tables"]["bets"]["Row"]
      );
      toast.success("Short position opened", {
        description: `You shorted ${fetcher.data.bet.amount} sips of ${fetcher.data.bet.asset}`,
      });
    }
  }, [fetcher.data]);
  return (
    <Card className={`h-full ${shortBet ? "bg-gray-200" : ""}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>Short</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        <fetcher.Form method="post" className="space-y-4">
          <input type="hidden" name="gameId" value={game.game_id} />
          <input type="hidden" name="type" value={TradeType.SHORT} />
          <div className="space-y-2">
            <label htmlFor="short-asset" className="text-sm font-medium">
              Select Asset
            </label>
            <Select
              value={shortBet?.asset}
              disabled={!!shortBet || isSubmitting}
              name="asset"
              onValueChange={(value) => {
                // Keep for UI feedback
              }}
            >
              <SelectTrigger id="short-asset">
                <SelectValue placeholder="Select an asset" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Crypto">Crypto</SelectItem>
                <SelectItem value="Gold">Gold</SelectItem>
                <SelectItem value="Stocks">Stocks</SelectItem>
                <SelectItem value="Bonds">Bonds</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label htmlFor="short-sips" className="text-sm font-medium">
              Amount of Sips
            </label>
            <Input
              id="short-sips"
              type="number"
              placeholder="Enter amount"
              value={shortBet?.amount}
              name="amount"
              min="0"
            />
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={!!shortBet || isSubmitting}
          >
            {!!shortBet
              ? `Short already placed on ${shortBet.asset}`
              : `Place Short`}
          </Button>
        </fetcher.Form>
      </CardContent>
    </Card>
  );
}
