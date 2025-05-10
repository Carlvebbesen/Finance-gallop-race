import { useState } from "react";
import type { GameSettings } from "~/components/game-settings-dialog";
import { generateGameId, generateMarketEvents } from "~/lib/utils";
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
import { createClient } from "~/lib/supabase/server";
import { type ActionFunctionArgs, redirect, useFetcher } from "react-router";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { supabase } = createClient(request);
  const formData = await request.formData();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return {
      error: "User not authenticated",
    };
  }

  const { data: player } = await supabase
    .from("player")
    .select()
    .eq("id", user.id)
    .single();

  const gameId = formData.get("gameId") as string;
  const gameSettings = JSON.parse(
    formData.get("gameSettings") as string
  ) as GameSettings;

  // Create game
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
    return {
      error: error instanceof Error ? error.message : "Could not create game",
    };
  }

  // Add creator as player
  const { error: playerError } = await supabase.from("player_in_game").insert({
    game_id: gameData.game_id,
    player_id: user.id,
    nickname: player?.nickname,
  });

  if (playerError) {
    return {
      error:
        playerError instanceof Error
          ? playerError.message
          : "Could not add player to game",
    };
  }
  console.log(gameData);

  return redirect(`/game/${gameData.game_id}/place/bets`);
};

export async function loader() {
  return generateGameId();
}

export default function CreateGame({ loaderData }: { loaderData: string }) {
  const fetcher = useFetcher<typeof action>();
  const [gameId, setGameId] = useState(loaderData);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [gameSettings, setGameSettings] = useState<GameSettings>({
    rounds: 12,
    shortMultiplier: 3,
    investMultiplier: 2,
    callPercent: 60,
    putPercent: 65,
    callBaseAmount: 7,
    putBaseAmount: 6,
  });

  const error = fetcher.data?.error;
  const loading = fetcher.state === "submitting";

  const handleRegenerateId = () => {
    setGameId(generateGameId());
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-background">
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
          <fetcher.Form method="post">
            {error && (
              <p className="text-sm text-destructive-500 text-center mb-4">
                {error}
              </p>
            )}
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
              <Button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create Market"}
              </Button>
            </CardFooter>
          </fetcher.Form>
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
