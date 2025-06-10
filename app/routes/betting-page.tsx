import { Link, redirect } from "react-router";
import { createClient } from "~/lib/supabase/client";
import type { Database } from "database.types";
import CallOptionsCard from "~/components/bets/call-options-card";
import { bet_placed, GameStates } from "~/lib/event";
import { GameIdCard } from "~/components/gameIdCopy";
import {
  readNickname,
  totalSipsToDrink,
  totalSipsToHandOut,
} from "~/lib/utils";
import type { Route } from "./+types/betting-page";
import { useState } from "react";
import { TradeType, type BetPlacedPayload, type InsertBet } from "~/types";
import { toast } from "sonner";
import BetCard from "~/components/bets/betCard";
import { ArrowBigRight } from "lucide-react";

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return redirect("/signup");
  }

  const { data: game } = await supabase
    .from("game")
    .select()
    .eq("game_id", params.gameId)
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

  const { data: bets } = await supabase
    .from("bets")
    .select()
    .eq("game_id", params.gameId)
    .eq("player_id", user.id);

  return {
    game: game as Database["public"]["Tables"]["game"]["Row"],
    placedBets: (bets ?? []) as Database["public"]["Tables"]["bets"]["Row"][],
    playerId: user.id,
  };
}

export function showTradeToast(bet: InsertBet) {
  const messages: Record<TradeType, { title: string; description: string }> = {
    [TradeType.INVEST]: {
      title: "Investment placed",
      description: `You invested ${bet.amount} sips in ${bet.asset}`,
    },
    [TradeType.SHORT]: {
      title: "Short position opened",
      description: `You shorted ${bet.asset} with ${bet.amount} sips`,
    },
    [TradeType.PUT]: {
      title: "Put option bought",
      description: `You bought a PUT on ${bet.asset} for ${bet.amount} sips`,
    },
    [TradeType.CALL]: {
      title: "Call option bought",
      description: `You bought a CALL on ${bet.asset} for ${bet.amount} sips`,
    },
  };

  const message = messages[bet.type as TradeType];

  toast.success(message.title, {
    description: message.description,
  });
}

export default function BettingPage({
  loaderData,
  params,
}: Route.ComponentProps) {
  const { game, placedBets, playerId } = loaderData;
  const [bets, setBets] = useState<InsertBet[]>(placedBets);

  const placeBet = async (bet: InsertBet) => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return redirect("/signup");
    }
    const gameId = params.gameId;

    if (
      (bet.type === TradeType.SHORT || bet.type === TradeType.INVEST) &&
      bet.amount < 1
    ) {
      toast.error("Could not place bet", {
        description: "Amount must be greater than 0",
      });
      return;
    }

    if (!bet.asset || bet.asset.length === 0) {
      toast.error("Could not place bet", {
        description: "Asset is required",
      });
      return;
    }
    let initAmount = bet.amount;
    if (bet.type === TradeType.CALL) {
      initAmount = game.call_base_amount;
    }
    if (bet.type === TradeType.PUT) {
      initAmount = game.put_base_amount;
    }
    const { error } = await supabase.from("bets").insert(bet);
    if (error) {
      toast.error("Could not place bet", {
        description: error.message,
      });
      return;
    }
    const nickname = readNickname();
    await supabase.channel(`game-${gameId}`).send({
      type: "broadcast",
      event: bet_placed,
      payload: {
        gameId: gameId,
        playerId: user.id,
        datetime: new Date().toISOString(),
        asset: bet.asset,
        amount: initAmount,
        type: bet.type,
        put_option_player: bet.put_option_player,
        nickname: nickname,
      } as BetPlacedPayload,
    });
    setBets((current) => [bet, ...current]);
    showTradeToast(bet);
  };

  return (
    <div className="container mx-auto pb-16 px-4 pt-8">
      <h1 className="text-3xl font-bold mb-8">Investment Platform</h1>
      <p className="text-gray-600 mb-6">
        You must either invest or Short an asset to proceed. (or both) Call and
        Put options are optional but can increase your potential winnings! The
        return for an Invest is {game.invest_multiplier}X and for a Short it is{" "}
        {game.short_multiplier}X, but if the asset wins, you have to drink as
        well!
      </p>
      <GameIdCard game={game} />
      <button
        type="button"
        disabled={
          bets.filter((bet) => bet.type === "short").length === 0 &&
          bets.filter((bet) => bet.type === "invest").length === 0
        }
        className={`
    fixed bottom-0 left-0 w-full p-4 text-white font-bold text-center shadow-md z-50 transition flex justify-around
    ${
      bets.filter((bet) => bet.type === "short").length === 0 &&
      bets.filter((bet) => bet.type === "invest").length === 0
        ? "bg-gray-400 cursor-not-allowed"
        : "bg-green-600/90 hover:bg-green-600"
    }
  `}
      >
        <Link to={`/game/${game.game_id}/player`}>
          I'm finished betting on the market
        </Link>
        <ArrowBigRight />
      </button>
      <div className="flex justify-between items-center mb-6 md:flex-row flex-col gap-4">
        <div className="text-lg text-red-400">
          Total Sips to drink:{" "}
          <span className="font-bold">{totalSipsToDrink(game, bets)}</span>
        </div>
        <div className="text-lg text-green-400">
          Potential sips to hand out:{" "}
          <span className="font-bold">{totalSipsToHandOut(game, bets)}</span>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <BetCard
          game={game}
          type={TradeType.INVEST}
          playerId={playerId}
          bet={bets.find((ib) => ib.type === TradeType.INVEST)}
          placeBet={placeBet}
        />
        <BetCard
          game={game}
          playerId={playerId}
          bet={bets.find((ib) => ib.type === TradeType.SHORT)}
          placeBet={placeBet}
          type={TradeType.SHORT}
        />
        <CallOptionsCard
          game={game}
          playerId={playerId}
          bet={bets.find((ib) => ib.type === TradeType.CALL)}
          investBet={bets.find((ib) => ib.type === TradeType.INVEST)}
          placeBet={placeBet}
        />
        {/* <PutOptionsCard game={game}
          bets={bets.find((ib) => ib.type === TradeType.PUT)}
          placeBet={placeBet} /> */}
      </div>{" "}
    </div>
  );
}
