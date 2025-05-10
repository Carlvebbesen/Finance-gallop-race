import { createClient } from "~/lib/supabase/server";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  type ActionFunctionArgs,
  redirect,
  useFetcher,
  useSearchParams,
} from "react-router";
import {
  player_joined,
  type BaseEvent,
  type NewMarketDayPayload,
} from "~/lib/eventTypes";
import { generateNextMarketRound } from "~/lib/utils";

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
    .select("nickname")
    .eq("id", user.id)
    .single();

  const gameId = formData.get("gameId") as string;
  if (gameId.length === 0) {
    return {
      error: "Game ID is required",
    };
  }

  // Check if game exists
  const { data: game } = await supabase
    .from("game")
    .select()
    .eq("game_id", gameId)
    .single();

  if (!game) {
    return {
      error: "Game not found",
    };
  }

  // Add player to game
  const { error } = await supabase.from("player_in_game").insert({
    player_id: user.id,
    game_id: gameId,
    nickname: player?.nickname,
  });
  console.log(error);
  if (error?.code === "23505") {
    return redirect(`/game/${gameId}/place/bets`);
  }

  if (error) {
    return {
      error: error instanceof Error ? error.message : "An error occurred",
    };
  }

  await supabase.channel(`game-${gameId}`).send({
    type: "broadcast",
    event: player_joined,
    payload: {
      playerId: user.id,
      datetime: new Date().toISOString(),
      gameId: game.game_id,
    } as BaseEvent,
  });

  return redirect(`/game/${gameId}/place/bets`);
};

export default function JoinGame() {
  const fetcher = useFetcher<typeof action>();
  const [searchParams] = useSearchParams();
  const error = fetcher.data?.error;
  const loading = fetcher.state === "submitting";
  const gameId = searchParams.get("gameId");
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 gap-8">
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Join Game</CardTitle>
            <CardDescription>Enter the game ID to join</CardDescription>
          </CardHeader>
          <CardContent>
            <fetcher.Form method="post">
              <div className="flex flex-col gap-6">
                {error && (
                  <p className="text-sm text-destructive-500">{error}</p>
                )}
                <input
                  type="text"
                  defaultValue={gameId ?? ""}
                  name="gameId"
                  placeholder="Game ID"
                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                />
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Joining game..." : "Join Game"}
                </Button>
              </div>
            </fetcher.Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
