import { useState } from "react";
import { useNavigate } from "react-router";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";

const SpectateGameCard = () => {
  const [gameId, setGameId] = useState("");
  const navigate = useNavigate();
  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="text-xl">Spectate a Game</CardTitle>
        <CardDescription>
          Enter a game ID for the screen that all the players will be viewing
          (preferably a big screen).
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Enter Game ID"
            className="w-full rounded-md border border-input bg-background px-3 py-2"
            onChange={(e) => setGameId(e.target.value)}
          />
          <Button
            onClick={() => {
              if (gameId) {
                navigate(`/game/${gameId}/spectate`);
              }
            }}
            disabled={gameId.length < 5}
          >
            Watch Game
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
export default SpectateGameCard;
