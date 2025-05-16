import {
  Link,
  type LoaderFunctionArgs,
  redirect,
  useNavigate,
} from "react-router";
import { useCallback, useState } from "react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardTitle } from "~/components/ui/card";
import {
  calculateSipsForPlayer,
  generateGameId,
  generateMarketEvents,
  generateNextMarketRound,
  readNickname,
  totalSipsToDrink,
} from "~/lib/utils";
import { createClient } from "~/lib/supabase/client";
import {
  call_option_used,
  game_state,
  GameStates,
  new_game,
  newMarketDay,
  sipsTaken,
} from "~/lib/event";
import { GameIdCard } from "~/components/gameIdCopy";
import { CallOptionConfirmation } from "~/components/player-call-option-dialog";
import { useListenGameUpdates } from "~/lib/useListenGameUpdates";
import type { Route } from "./+types/player";
import {
  TradeType,
  type Bet,
  type CallOptionUsedPayload,
  type Game,
  type GameStatePayload,
  type Investor,
  type newGamePayload,
  type NewMarketDayPayload,
  type SipsTakenPayload,
} from "~/types";
import { toast } from "sonner";

export async function clientLoader({ params }: LoaderFunctionArgs) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/signup");
  }

  // Get current game using game_id from params
  const { data: game } = await supabase
    .from("game")
    .select("*")
    .eq("game_id", params.gameId!)
    .single();
  if (!game) {
    throw new Error("No game found");
  }

  // Get all active bets for the current user in this game
  const { data: bets } = await supabase
    .from("bets")
    .select("*")
    .eq("game", params.gameId!)
    .eq("player", user.id);

  const { data: player, error: playerError } = await supabase
    .from("player_in_game")
    .select()
    .eq("game_id", params.gameId!)
    .single();
  console.log(playerError);
  if (playerError) {
    return redirect("/join/game");
  }
  return {
    player,
    game,
    bets: bets || [],
    isAdmin: game.created_by === user.id,
    sipsToTake: totalSipsToDrink(game, bets ?? []),
    callBet: bets?.find((b) => b.type === TradeType.CALL),
  };
}
export default function PlayerPage({ loaderData }: Route.ComponentProps) {
  const { player, game, sipsToTake, isAdmin, bets, callBet } = loaderData;
  const [investor, setInvestor] = useState<Investor>(player);
  const [ongoingGame, setOngoingGame] = useState(game);
  const supabase = createClient();
  const channel = supabase.channel(`game-${game.game_id}`);
  const navigate = useNavigate();
  const [isConfirmationVisible, setIsConfirmationVisible] =
    useState<boolean>(false);
  const handleShowConfirmation = useCallback(() => {
    if (investor.call_option_used === null && callBet?.asset != null) {
      setIsConfirmationVisible(true);
    }
  }, [setIsConfirmationVisible, callBet, investor]);

  const { isConnected } = useListenGameUpdates({
    gameId: game.game_id,
    callback: handleShowConfirmation,
    gameFinished: setOngoingGame,
  });

  const handleConfirmCallOption = async () => {
    setIsConfirmationVisible(false);
    const { error } = await supabase
      .from("player_in_game")
      .update({
        call_option_used: true,
      })
      .eq("player_id", investor.player_id);
    if (error) {
      toast.error(`Error occured: ${error.message}`);
      return;
    }
    await channel.send({
      type: "broadcast",
      event: call_option_used,
      payload: {
        playerId: investor.player_id,
        nickname: readNickname(),
        datetime: new Date().toISOString(),
        gameId: game.game_id,
        assetType: callBet?.asset,
        callOptionUsed: true,
      } as CallOptionUsedPayload,
    });
    setInvestor((inv) => {
      return { ...inv, call_option_used: true };
    });
  };

  const handleDeclineCallOption = async () => {
    setIsConfirmationVisible(false);
    const { error } = await supabase
      .from("player_in_game")
      .update({
        call_option_used: false,
      })
      .eq("player_id", investor.player_id);
    if (error) {
      toast.error(`Error occured: ${error.message}`);
      return;
    }
    await channel.send({
      type: "broadcast",
      event: call_option_used,
      payload: {
        playerId: investor.player_id,
        datetime: new Date().toISOString(),
        nickname: readNickname(),
        gameId: game.game_id,
        assetType: callBet?.asset,
        callOptionUsed: false,
      } as CallOptionUsedPayload,
    });
    setInvestor((inv) => {
      return { ...inv, call_option_used: false };
    });
  };

  const handleSipsTaken = async () => {
    const { error } = await supabase
      .from("player_in_game")
      .update({
        sips_taken: true,
      })
      .eq("player_id", investor.player_id);
    if (error) {
      toast.error(`Error occured: ${error.message}`);
      return;
    }
    await channel.send({
      type: "broadcast",
      event: sipsTaken,
      payload: {
        playerId: investor.player_id,
        datetime: new Date().toISOString(),
        nickname: readNickname(),
        gameId: game.game_id,
        sipsCount: sipsToTake,
      } as SipsTakenPayload,
    });
    setInvestor((inv) => {
      return { ...inv, sips_taken: true };
    });
  };

  const handleNextRound = async () => {
    await channel.send({
      type: "broadcast",
      event: newMarketDay,
      payload: {
        playerId: investor.player_id,
        datetime: new Date().toISOString(),
        gameId: game.game_id,
        changes: generateNextMarketRound(100 / (game.rounds * 0.6)),
      } as NewMarketDayPayload,
    });
  };
  const handleStartGame = async () => {
    await channel.send({
      type: "broadcast",
      event: game_state,
      payload: {
        playerId: investor.player_id,
        datetime: new Date().toISOString(),
        gameId: game.game_id,
        nextState: GameStates.IN_PROGRESS,
      } as GameStatePayload,
    });
    setOngoingGame((g) => {
      return { ...g, state: GameStates.IN_PROGRESS };
    });
  };

  const createNewGame = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return;
    }
    toast.info("Creating game ....");
    const { data: gameData, error } = await supabase
      .from("game")
      .insert({
        market_events: generateMarketEvents(
          Math.ceil(game.rounds * 0.5),
          100 / game.rounds
        ).map((item) => JSON.stringify(item)),
        rounds: game.rounds,
        put_percent: game.put_percent,
        call_percent: game.call_percent,
        created_by: user.id,
        call_base_amount: game.call_base_amount,
        put_base_amount: game.put_base_amount,
        game_id: generateGameId(),
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
    await channel.send({
      type: "broadcast",
      event: new_game,
      payload: {
        playerId: investor.player_id,
        datetime: new Date().toISOString(),
        gameId: ongoingGame.game_id,
        newGameId: gameData.game_id,
      } satisfies newGamePayload,
    });
    return navigate(`/game/${gameData.game_id}/place/bets`);
  };

  return (
    <div className="container max-w-md mx-auto p-4 space-y-6">
      <Button className="mb-10">
        <Link to={"/"}>GO HOME</Link>
      </Button>
      <Card className="p-6">
        <h1 className="text-2xl font-bold mb-4">
          Game Stats for {investor.nickname}
        </h1>

        {!investor.sips_taken && sipsToTake > 0 && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-red-500 mb-2">
              Sips to Take: {sipsToTake}
            </h2>
            <Button
              onClick={handleSipsTaken}
              className="w-full"
              variant="destructive"
            >
              I took my sips!
            </Button>
          </div>
        )}
        {investor.sips_taken && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-red-500 mb-2">
              {sipsToTake} Sips taken, Lets Play 🤘
            </h2>
          </div>
        )}

        {isAdmin && ongoingGame.state === GameStates.IN_PROGRESS && (
          <div className="mt-6">
            <Button
              onClick={handleNextRound}
              className="w-full"
              variant="outline"
            >
              Next Market Round
            </Button>
          </div>
        )}
        {isAdmin && ongoingGame.state === GameStates.NOT_STARTED && (
          <div className="mt-6">
            <Button
              onClick={handleStartGame}
              className="w-full"
              variant="outline"
            >
              Open Market
            </Button>
          </div>
        )}
        {ongoingGame.state === GameStates.FINISHED &&
          playerStatsMarketClose(bets, ongoingGame, investor)}
        {/* Handle case where game is finieshed TODO */}
        <GameIdCard game={game} />
        <CallOptionConfirmation
          isVisible={isConfirmationVisible}
          assetName={callBet?.asset}
          onConfirm={handleConfirmCallOption}
          onDecline={handleDeclineCallOption}
          playerName={investor.nickname ?? "No name"}
        />
      </Card>
      {ongoingGame.state === GameStates.FINISHED && isAdmin && (
        <Button onClick={() => createNewGame()} className="mb-10">
          Create New Game ( Same Settings )
        </Button>
      )}
    </div>
  );
}

const playerStatsMarketClose = (bets: Bet[], game: Game, player: Investor) => {
  const stats = calculateSipsForPlayer(bets, player, game, {
    gold: game.gold_pos ?? 0,
    bonds: game.bonds_pos ?? 0,
    stocks: game.stocks_pos ?? 0,
    crypto: game.crypto_pos ?? 0,
  });
  return (
    <Card>
      <CardTitle className="p-2">Result after market Close</CardTitle>
      <CardContent>
        <div className="flex flex-col gap-2">
          <div className="flex gap-5 justify-center border-b-2">
            <h3>Sips To hand out:</h3>{" "}
            <h2 className="text-xl font-semibold">{stats.sipsToHandOut}</h2>
          </div>
          <div className="flex gap-5 justify-center border-b-2">
            <h3>Additional Sips to take:</h3>{" "}
            <h2 className="text-xl font-semibold">{stats.sipsToTake}</h2>
          </div>
          <div className="flex gap-5 justify-center border-b-2">
            <h3>Winning assets:</h3>{" "}
            <h2 className="text-xl font-semibold">
              {stats.winningAssets.join(" , ")}
            </h2>
          </div>
          <div className="flex gap-5 justify-center border-b-2">
            <h3>Loosing assets:</h3>{" "}
            <h2 className="text-xl font-semibold">
              {stats.loosingAssets.join(" , ")}
            </h2>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
