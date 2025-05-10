import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useFetcher } from "react-router";
import useBetStore from "~/stores/bet-store";
import type { Database } from "database.types";
import type { action } from "~/routes/betting-page";
import { useEffect } from "react";
import { AssetType, TradeType } from "~/lib/eventTypes";
import type { Game } from "~/routes/game.client";

interface Props {
  game: Game;
}

export default function InvestCard({ game }: Props) {
  const fetcher = useFetcher<typeof action>();
  const investBet = useBetStore((state) => state.investBet);
  const addInvestBet = useBetStore((state) => state.setInvestBet);

  const isSubmitting = fetcher.state === "submitting";

  useEffect(() => {
    if (fetcher.data?.error) {
      toast.error("Could not place bet", {
        description: fetcher.data.error,
      });
    }

    if (fetcher.data?.success) {
      console.log("fetcher.data.bet", fetcher.data.bet);
      addInvestBet(
        fetcher.data.bet as Database["public"]["Tables"]["bets"]["Row"]
      );
      toast.success("Investment placed", {
        description: `You invested ${fetcher.data.bet.amount} sips in ${fetcher.data.bet.asset}`,
      });
    }
  }, [fetcher.data]);

  return (
    <Card className={`h-full ${investBet ? "bg-gray-200" : ""}`}>
      <CardHeader>
        <CardTitle>Invest</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <fetcher.Form method="post" className="space-y-4">
          <input type="hidden" name="gameId" value={game.game_id} />
          <input type="hidden" name="type" value={TradeType.INVEST} />
          <div className="space-y-2">
            <label htmlFor="asset" className="text-sm font-medium">
              Select Asset
            </label>
            <Select
              name="asset"
              disabled={!!investBet || isSubmitting}
              value={investBet?.asset}
              onValueChange={(value) => {
                // Keep for UI feedback
              }}
            >
              <SelectTrigger id="asset">
                <SelectValue placeholder="Select an asset" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={AssetType.CRYPTO}>Crypto</SelectItem>
                <SelectItem value={AssetType.GOLD}>Gold</SelectItem>
                <SelectItem value={AssetType.STOCKS}>Stocks</SelectItem>
                <SelectItem value={AssetType.BONDS}>Bonds</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label htmlFor="amount" className="text-sm font-medium">
              Amount of Sips
            </label>
            <Input
              id="amount"
              name="amount"
              type="number"
              disabled={!!investBet || isSubmitting}
              placeholder="Enter amount"
              min="0"
              value={investBet?.amount}
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={!!investBet || isSubmitting}
          >
            {!!investBet
              ? `Bet already placed on ${investBet.asset}`
              : `Place Investment`}
          </Button>
        </fetcher.Form>
      </CardContent>
    </Card>
  );
}
