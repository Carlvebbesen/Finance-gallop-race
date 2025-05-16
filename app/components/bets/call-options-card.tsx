import { useRef, useState, type JSX } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { AssetType, TradeType, type Game, type InsertBet } from "~/types";
import { ASSET_LABELS } from "~/lib/event";

interface Props {
  game: Game;
  bet: InsertBet | undefined;
  investBet: InsertBet | undefined;
  playerId: string;
  placeBet: (bet: InsertBet) => Promise<Response | undefined>;
}

export default function CallOptionsCard({
  game,
  bet,
  placeBet,
  investBet,
  playerId,
}: Props) {
  const [loading, setLoading] = useState(false);

  const asset = useRef("");

  return (
    <Card className={`h-full ${bet || !investBet ? "bg-gray-200" : ""}`}>
      <CardHeader>
        <CardTitle>
          Buy Call Options for {game.call_base_amount} sips{" "}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <input type="hidden" name="gameId" value={game.game_id} />
        <input type="hidden" name="type" value={TradeType.CALL} />
        <div className="space-y-2">
          <label htmlFor="call-asset" className="text-sm font-medium">
            Select Asset
          </label>
          <Select
            value={bet?.asset}
            name="asset"
            onValueChange={(value) => (asset.current = value)}
          >
            <SelectTrigger id="call-asset">
              <SelectValue placeholder="Select an asset" />
            </SelectTrigger>
            <SelectContent>
              {Object.values(AssetType).reduce<JSX.Element[]>((acc, asset) => {
                if (investBet?.asset !== asset) {
                  acc.push(
                    <SelectItem key={asset} value={asset}>
                      {ASSET_LABELS[asset]}
                    </SelectItem>
                  );
                }
                return acc;
              }, [])}
            </SelectContent>
          </Select>
        </div>
        <Button
          type="button"
          className="w-full"
          disabled={!!bet || loading || !investBet}
          onClick={() => {
            setLoading(true);
            placeBet({
              amount: game.call_base_amount,
              asset: asset.current,
              game_id: game.game_id,
              player_id: playerId,
              type: TradeType.CALL,
            });
            setLoading(false);
            return;
          }}
        >
          {!!bet
            ? `Call option already purchased for ${bet.asset}`
            : "Buy call options"}
        </Button>
      </CardContent>
    </Card>
  );
}
