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
import { AssetType, TradeType, type Game, type InsertBet } from "~/types";
import { useRef, useState } from "react";
interface Props {
  game: Game;
  bet: InsertBet | undefined;
  playerId: string;
  type: TradeType;
  placeBet: (bet: InsertBet) => Promise<Response | undefined>;
}

export default function NormalBetCard({
  game,
  bet,
  placeBet,
  type,
  playerId,
}: Props) {
  const [loading, setLoading] = useState(false);

  const asset = useRef("");
  const amount = useRef("");

  return (
    <Card className={`h-full ${bet ? "bg-gray-200" : ""}`}>
      <CardHeader>
        <CardTitle>{type}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <input type="hidden" name="gameId" value={game.game_id} />
        <input type="hidden" name="type" value={type} />
        <div className="space-y-2">
          <label htmlFor="asset" className="text-sm font-medium">
            Select Asset
          </label>
          <Select
            name="asset"
            disabled={!!bet || loading}
            value={bet?.asset}
            onValueChange={(value) => {
              asset.current = value;
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
            onChange={(value) => (amount.current = value.target.value)}
            disabled={!!bet || loading}
            placeholder="Enter amount"
            min="0"
            value={bet?.amount}
          />
        </div>

        <Button
          type="button"
          className="w-full"
          onClick={() => {
            try {
              const parsedAmount = parseInt(amount.current);
              setLoading(true);
              placeBet({
                amount: parsedAmount,
                asset: asset.current,
                game_id: game.game_id,
                player_id: playerId,
                type: type,
              });
              setLoading(false);
            } catch (e) {
              setLoading(false);
              return;
            }
          }}
          disabled={!!bet || loading}
        >
          {!!bet ? `Bet already placed on ${bet.asset}` : `Place Bet`}
        </Button>
      </CardContent>
    </Card>
  );
}
