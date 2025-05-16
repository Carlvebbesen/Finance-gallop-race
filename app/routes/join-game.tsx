import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Link, useNavigate } from "react-router";
import { player_joined } from "~/lib/event";
import { readNickname } from "~/lib/utils";
import { useRef, useState } from "react";
import { createClient } from "~/lib/supabase/client";
import { toast } from "sonner";
import type { BaseEvent } from "~/types";

export default function JoinGame() {
  const gameId = useRef("");
  const navigate = useNavigate();
  const join = async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Could not find user");
      return;
    }

    if (gameId.current.length === 0) {
      toast.error("Game ID is required");
      return;
    }
    const { data: game, error: gameError } = await supabase
      .from("game")
      .select()
      .eq("game_id", gameId.current)
      .single();

    if (!game || gameError) {
      console.log(gameError);
      toast.error("Could not find game with Given Id");
      return;
    }
    const nickname = readNickname();

    const { error } = await supabase.from("player_in_game").insert({
      player_id: user.id,
      game_id: game.game_id,
      nickname: nickname,
    });
    if (error?.code === "23505") {
      return navigate(`/game/${game.game_id}/place/bets`);
    }

    if (error) {
      console.log(error);
      toast.error(`Error occured: ${error.message}`);
      return;
    }

    await supabase.channel(`game-${game.game_id}`).send({
      type: "broadcast",
      event: player_joined,
      payload: {
        playerId: user.id,
        datetime: new Date().toISOString(),
        gameId: game.game_id,
        nickname: readNickname(),
      } as BaseEvent,
    });
    return navigate(`/game/${game.game_id}/place/bets`);
  };

  const [loading, setLoading] = useState(false);
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 gap-8">
      <Button>
        <Link to={"/"}> HOME</Link>
      </Button>
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Join Game</CardTitle>
            <CardDescription>Enter the game ID to join</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-6">
              <input
                onChange={(e) => (gameId.current = e.target.value)}
                name="gameId"
                placeholder="Game ID"
                className="w-full rounded-md border border-input bg-background px-3 py-2"
              />
              <Button
                type="button"
                className="w-full"
                disabled={loading}
                onClick={async () => {
                  setLoading(true);
                  await join();
                  setLoading(false);
                }}
              >
                {loading ? "Joining game..." : "Join Game"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
