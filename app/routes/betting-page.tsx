import {
  type ActionFunctionArgs,
  Link,
  redirect,
  useLoaderData,
} from "react-router";
import { Button } from "~/components/ui/button";
import { createClient } from "~/lib/supabase/server";
import InvestCard from "~/components/bets/invest-card";
import type { Database } from "database.types";
import useBetStore from "~/stores/bet-store";
import { useEffect } from "react";
import ShortCard from "~/components/bets/short-card";
import CallOptionsCard from "~/components/bets/call-options-card";
import {
  bet_placed,
  GameStates,
  TradeType,
  type BetPlacedPayload,
} from "~/lib/eventTypes";
import { GameIdCard } from "~/components/gameIdCopy";
export const action = async ({ request, params }: ActionFunctionArgs) => {
  const { supabase } = createClient(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return redirect("/signup");
  }
  const formData = await request.formData();
  const asset = formData.get("asset") as string;
  const type = formData.get("type") as TradeType;
  const amount = Number(formData.get("amount"));
  const gameId = params.gameId;

  if ((type === TradeType.SHORT || type === TradeType.INVEST) && amount < 1) {
    return {
      error: "Amount must be greater than 0",
    };
  }

  if (!asset) {
    return {
      error: "Asset is required",
    };
  }
  let initAmount = amount;
  if (type === TradeType.CALL) {
    initAmount = Number(formData.get("call_base_amount")) ?? 7;
  }
  if (type === TradeType.PUT) {
    initAmount = Number(formData.get("put_base_amount")) ?? 7;
  }
  const betObj = {
    game: gameId!,
    player: user.id,
    asset: asset,
    amount: initAmount,
    type: type,
    created_at: new Date().toISOString(),
    put_option_player: null,
  } satisfies Database["public"]["Tables"]["bets"]["Row"];

  const { error } = await supabase.from("bets").insert(betObj);
  console.log("error", error);
  if (error) {
    return {
      error: error instanceof Error ? error.message : "An error occurred",
    };
  }
  const { data: player } = await supabase
    .from("player")
    .select()
    .eq("id", user.id)
    .single();

  await supabase.channel(`game-${gameId}`).send({
    type: "broadcast",
    event: bet_placed,
    payload: {
      gameId: gameId!,
      playerId: user.id,
      datetime: new Date().toISOString(),
      asset: asset,
      amount: initAmount,
      type: type,
      put_option_player: null,
      nickname: player?.nickname,
    } as BetPlacedPayload,
  });
  return {
    success: true,
    bet: betObj,
  };
};

export async function loader({ request, params }: ActionFunctionArgs) {
  const { supabase } = createClient(request);

  const { data: game } = await supabase
    .from("game")
    .select()
    .eq("game_id", params.gameId!)
    .single();

  if (!game) {
    throw new Error("Game not found");
  }

  if (game.state === GameStates.FINISHED) {
    return redirect("/");
  }
  if (game.state === GameStates.IN_PROGRESS) {
    return redirect(`/game/${game.game_id}/player`);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return redirect("/signup");
  }

  const { data: bets } = await supabase
    .from("bets")
    .select()
    .eq("game", params.gameId!)
    .eq("player", user.id);

  return {
    game: game as Database["public"]["Tables"]["game"]["Row"],
    bets: (bets ?? []) as Database["public"]["Tables"]["bets"]["Row"][],
    playerId: user.id,
  };
}

export default function BettingPage() {
  const { game, bets } = useLoaderData<typeof loader>();
  const updateAllBets = useBetStore((state) => state.updateAllBets);
  const sipsToDrink = useBetStore((state) => state.getTotalSipsToDrink);
  const sipsToHandOut = useBetStore((state) => state.getTotalSipsToHandOut);
  useEffect(() => {
    updateAllBets(bets);
  }, [bets]);
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Investment Platform</h1>
      <p className="text-gray-600 mb-6">
        You must either invest or Short an asset to proceed. (or both) Call and
        Put options are optional but can increase your potential winnings! The
        return for an Invest is {game.invest_multiplier}X and for a Short it is{" "}
        {game.short_multiplier}X, but if the asset wins, you have to drink as
        well!
      </p>

      <div className="flex justify-between items-center mb-6 md:flex-row flex-col gap-4">
        <Button
          type="submit"
          disabled={
            bets.filter((bet) => bet.type === "short").length === 0 &&
            bets.filter((bet) => bet.type === "invest").length === 0
          }
        >
          <Link to={`/game/${game.game_id}/player`}>
            {"I'm finished betting on the market"}
          </Link>
        </Button>
        <div className="text-lg">
          Total Sips to drink:{" "}
          <span className="font-bold">{sipsToDrink()}</span>
        </div>
        <div className="text-lg">
          Total sips to hand out:{" "}
          <span className="font-bold">{sipsToHandOut()}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InvestCard game={game} />
        <ShortCard game={game} />
        <CallOptionsCard game={game} />
        {/* <PutOptionsCard game={game} /> */}
      </div>
      <GameIdCard game={game} />
    </div>
  );
}
