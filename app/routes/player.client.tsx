import {
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  redirect,
  useLoaderData,
} from "react-router";
import { useCallback, useState } from "react";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import {
  calculateTotalSipsToDrink,
  calculateTotalSipsToHandOut,
  generateNextMarketRound,
} from "~/lib/utils";
import { createClient, supabase } from "~/lib/supabase/client";
import {
  call_option_used,
  game_state,
  GameStates,
  newMarketDay,
  sipsTaken,
  TradeType,
  type CallOptionUsedPayload,
  type GameStatePayload,
  type NewMarketDayPayload,
  type SipsTakenPayload,
} from "~/lib/eventTypes";
import { GameIdCard } from "~/components/gameIdCopy";
import { CallOptionConfirmation } from "~/components/player-call-option-dialog";
import type { Investor } from "./game.client";
import { useListenGameUpdates } from "~/lib/useListenGameUpdates.client";
import type { Route } from "./+types/player.client";

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

  if (playerError || !player) {
    throw Error("Player not found");
  }
  // Calculate total sips to take and give
  const investBet = bets?.find((bet) => bet.type === TradeType.INVEST) ?? null;
  const shortBet = bets?.find((bet) => bet.type === TradeType.SHORT) ?? null;
  const callBet = bets?.find((bet) => bet.type === TradeType.CALL) ?? null;
  const putBet = bets?.find((bet) => bet.type === TradeType.PUT) ?? null;

  return {
    player,
    game,
    bets: bets || [],
    isAdmin: game.created_by === user.id,
    sipsToTake: calculateTotalSipsToDrink(
      investBet,
      shortBet,
      callBet,
      putBet,
      game.call_base_amount,
      game.put_base_amount
    ),
    sipsToGive: calculateTotalSipsToHandOut(
      shortBet,
      investBet,
      game.short_multiplier,
      game.invest_multiplier
    ),
    callBet,
  };
}
export default function PlayerPage({ loaderData }: Route.ComponentProps) {
  const { player, game, sipsToTake, sipsToGive, isAdmin, bets, callBet } =
    loaderData;
  const [showSipsTaken, setShowSipsTaken] = useState(true);
  const [gameState, setGameState] = useState(game.state);
  const [investor, setInvestor] = useState<Investor>(player);
  const channel = supabase.channel(`game-${game.game_id}`);

  const [isConfirmationVisible, setIsConfirmationVisible] =
    useState<boolean>(false);
  const [targetAsset, setTargetAsset] = useState<string>(
    callBet?.asset ?? "NOT SELECTED"
  );

  const handleShowConfirmation = useCallback(() => {
    if (
      (investor.call_option_used === null ||
        investor.call_option_used === undefined) &&
      callBet !== null
    ) {
      setTargetAsset(callBet?.asset ?? "NOT SELECTED");
      setIsConfirmationVisible(true);
    }
  }, [setTargetAsset, setIsConfirmationVisible, callBet, investor]);
  const { isConnected } = useListenGameUpdates({
    gameId: game.game_id,
    callback: handleShowConfirmation,
  });

  const handleConfirmCallOption = async () => {
    setIsConfirmationVisible(false);
    const { error } = await supabase
      .from("player_in_game")
      .update({
        call_option_used: true,
      })
      .eq("player_id", investor.player_id);
    console.log(error);
    await channel.send({
      type: "broadcast",
      event: call_option_used,
      payload: {
        playerId: investor.player_id,
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
    console.log(`User declined call option for ${targetAsset}`);
    setIsConfirmationVisible(false);
    const { error } = await supabase
      .from("player_in_game")
      .update({
        call_option_used: false,
      })
      .eq("player_id", investor.player_id!);
    await channel.send({
      type: "broadcast",
      event: call_option_used,
      payload: {
        playerId: investor.player_id,
        datetime: new Date().toISOString(),
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
    await channel.send({
      type: "broadcast",
      event: sipsTaken,
      payload: {
        playerId: investor.player_id,
        datetime: new Date().toISOString(),
        gameId: game.game_id,
        sipsCount: sipsToTake,
      } as SipsTakenPayload,
    });
    setShowSipsTaken(false);
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
    setGameState(GameStates.IN_PROGRESS);
  };

  return (
    <div className="container max-w-md mx-auto p-4 space-y-6">
      <Card className="p-6">
        <h1 className="text-2xl font-bold mb-4">
          Game Stats for {investor.nickname}
        </h1>

        {showSipsTaken && sipsToTake > 0 && (
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

        {sipsToGive > 0 && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-green-500">
              Sips to Give: {sipsToGive}
            </h2>
            <p className="text-sm text-gray-500">
              You can give these out if you win your bets!
            </p>
          </div>
        )}

        {isAdmin && (
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
        {isAdmin && gameState === GameStates.NOT_STARTED && (
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
        <GameIdCard game={game} />
        <CallOptionConfirmation
          isVisible={isConfirmationVisible}
          assetName={targetAsset}
          onConfirm={handleConfirmCallOption}
          onDecline={handleDeclineCallOption}
          playerName={investor.nickname ?? "No name"}
        />
      </Card>
    </div>
  );
}
function usePlayerEvents(arg0: { gameId: string; callback: () => void }): {
  isConnected: any;
} {
  throw new Error("Function not implemented.");
}
