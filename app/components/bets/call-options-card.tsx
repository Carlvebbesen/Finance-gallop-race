import { useEffect, type JSX } from "react";
import { toast } from "sonner";
import useBetStore from "~/stores/bet-store";
import { useFetcher } from "react-router";
import type { Database } from "database.types";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import type { action } from "~/routes/betting-page";
import { AssetType, TradeType, ASSET_LABELS } from "~/lib/eventTypes";

interface Props {
  game: Database["public"]["Tables"]["game"]["Row"];
}

export default function CallOptionsCard({ game }: Props) {
  const fetcher = useFetcher<typeof action>();
  const investBet = useBetStore((state) => state.investBet);
  const addCallBet = useBetStore((state) => state.setCallBet);
  const callBet = useBetStore((state) => state.callBet);

  const isSubmitting = fetcher.state === "submitting";

  useEffect(() => {
    if (fetcher.data?.error) {
      toast.error("Could not place bet", {
        description: fetcher.data.error,
      });
    }

    if (fetcher.data?.success) {
      console.log("fetcher.data.bet", fetcher.data.bet);
      addCallBet(
        fetcher.data.bet as Database["public"]["Tables"]["bets"]["Row"]
      );
      toast.success("Call options purchased", {
        description: `You bought call options for ${fetcher.data.bet.asset}`,
      });
    }
  }, [fetcher.data]);
  console.log("callBet", callBet);
  return (
    <Card className={`h-full ${callBet || !investBet ? "bg-gray-200" : ""}`}>
      <CardHeader>
        <CardTitle>
          Buy Call Options for {game.call_base_amount} sips{" "}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <fetcher.Form method="post" className="space-y-4">
          <input type="hidden" name="gameId" value={game.game_id} />
          <input type="hidden" name="type" value={TradeType.CALL} />
          <div className="space-y-2">
            <label htmlFor="call-asset" className="text-sm font-medium">
              Select Asset
            </label>
            <Select value={callBet?.asset} name="asset">
              <SelectTrigger id="call-asset">
                <SelectValue placeholder="Select an asset" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(AssetType).reduce<JSX.Element[]>(
                  (acc, asset) => {
                    if (investBet?.asset !== asset) {
                      acc.push(
                        <SelectItem key={asset} value={asset}>
                          {ASSET_LABELS[asset]}
                        </SelectItem>
                      );
                    }
                    return acc;
                  },
                  []
                )}
              </SelectContent>
            </Select>
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={!!callBet || isSubmitting}
          >
            {!!callBet
              ? `Call option already purchased for ${callBet.asset}`
              : "Buy call options"}
          </Button>
        </fetcher.Form>
      </CardContent>
    </Card>
  );
}
