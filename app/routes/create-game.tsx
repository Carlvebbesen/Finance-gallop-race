import { useState } from "react";
import {
  generateGameId,
  generateMarketEvents,
  readNickname,
} from "~/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import GameSettingsDialog from "~/components/game-settings-dialog";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Settings } from "lucide-react";
import type { Route } from "./+types/create-game";
import { createClient } from "~/lib/supabase/client";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router";
import type { GameSettings } from "~/types";

export async function clientLoader() {
  return generateGameId();
}

export default function CreateGame({ loaderData }: Route.ComponentProps) {
  const [gameId, setGameId] = useState(loaderData);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [loading, setloading] = useState(false);
  const navigate = useNavigate();
  const [gameSettings, setGameSettings] = useState<GameSettings>({
    rounds: 12,
    shortMultiplier: 3,
    investMultiplier: 2,
    callPercent: 60,
    putPercent: 65,
    callBaseAmount: 7,
    putBaseAmount: 6,
  });

  const handleRegenerateId = () => {
    setGameId(generateGameId());
  };

  const create = async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      toast.error("User Not Authenticated");
      return;
    }
    const { data: gameData, error } = await supabase
      .from("game")
      .insert({
        game_id: gameId,
        short_multiplier: gameSettings.shortMultiplier,
        invest_multiplier: gameSettings.investMultiplier,
        call_base_amount: gameSettings.callBaseAmount,
        put_base_amount: gameSettings.putBaseAmount,
        market_events: generateMarketEvents(
          Math.ceil(gameSettings.rounds * 0.5),
          100 / gameSettings.rounds
        ).map((item) => JSON.stringify(item)),
        rounds: gameSettings.rounds,
        put_percent: gameSettings.putPercent,
        call_percent: gameSettings.callPercent,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) {
      console.log(error);
      toast.error("Could not create game");
      return;
    }

    const { error: playerError } = await supabase
      .from("player_in_game")
      .insert({
        game_id: gameData.game_id,
        player_id: user.id,
        nickname: readNickname(),
      });

    if (playerError) {
      console.log(playerError);
      toast.error("Could not add player to game");
      return;
    }

    return navigate(`/game/${gameData.game_id}/place/bets`);
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-background flex-col">
      <Button className="mb-10">
        <Link to={"/"}>GO HOME</Link>
      </Button>
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-xl text-center">
            Create New Stock Market
          </CardTitle>
          <CardDescription className="text-center">
            Set up a new Stock Market for players to join
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="gameId">Game ID</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRegenerateId}
                className="h-8 px-2 text-xs"
              >
                Regenerate
              </Button>
            </div>
            <Input
              id="gameId"
              name="gameId"
              value={gameId}
              readOnly
              className="font-mono text-center text-lg tracking-wider"
            />
            <input
              type="hidden"
              name="gameSettings"
              value={JSON.stringify(gameSettings)}
            />
            <p className="text-xs text-muted-foreground text-center">
              Share this code with players to join your game
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full flex items-center justify-center gap-2 mt-6"
            onClick={() => setSettingsOpen(true)}
          >
            <Settings className="h-4 w-4" />
            <span>Game Settings</span>
          </Button>

          <CardFooter className="flex justify-center px-0 mt-6">
            <Button
              type="button"
              disabled={loading}
              onClick={async () => {
                setloading(true);
                await create();
                setloading(false);
              }}
            >
              {loading ? "Creating..." : "Create Market"}
            </Button>
          </CardFooter>
        </CardContent>
      </Card>

      <GameSettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        settings={gameSettings}
        onSaveSettings={setGameSettings}
      />
    </div>
  );
}
