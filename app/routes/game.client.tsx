import type { Database } from "database.types";
import { useCallback, useState } from "react";
import { redirect, type LoaderFunctionArgs } from "react-router";
import { createClient } from "~/lib/supabase/client";
import { useRealtimeGame } from "~/lib/useRealtimeGame.client";
import type { Route } from "./+types/game.client";
import AssetCards from "~/components/view/asset-cards";
import AssetGrid from "~/components/view/asset-grid";
import MarketEvents from "~/components/view/market-events";
import InvestorSection from "~/components/view/investor-section";
import MarketEventCards from "~/components/view/market.event-card";
import {
  AssetType,
  bet_placed,
  game_state,
  GameStates,
  newMarketDay,
  player_joined,
  TradeType,
  type AssetChange,
  type BaseEvent,
  type BetPlacedPayload,
  type Event,
  type MarketEventCard,
  type NewMarketDayPayload,
} from "~/lib/eventTypes";
import GameResultsDialog from "~/components/view/gameFinishedDialog";
import { calculateNewTrend, calculateSips, getLeadingAsset } from "~/lib/utils";
import { MarketEventDialog } from "~/components/view/marketEventDialog";
import { WavyBackground } from "~/components/backgrounds/background-waves";
import { CallOptionReminderBanner } from "~/components/view/callOptionReminderBanner";

export interface AssetStateValue {
  asset: AssetType;
  position: number;
  lastChange: number;
  currentTrendSum: number;
}

export type currentAssets = Record<AssetType, AssetStateValue>;

export type Bet = Database["public"]["Tables"]["bets"]["Row"];
export type Game = Database["public"]["Tables"]["game"]["Row"];

export type Investor = Database["public"]["Tables"]["player_in_game"]["Row"];

export async function clientLoader({ params }: LoaderFunctionArgs) {
  const supabase = createClient();

  const { data: game, error: gameError } = await supabase
    .from("game")
    .select("*")
    .eq("game_id", params.gameId!)
    .single();
  const { data, error } = await supabase
    .from("player_in_game")
    .select()
    .eq("game_id", params.gameId!);

  if (gameError) {
    return redirect("/");
  }
  if (error) throw new Error("Failed to fetch players");

  const { data: bets, error: betsError } = await supabase
    .from("bets")
    .select()
    .eq("game", params.gameId!);
  if (betsError) throw new Error("Failed to fetch bets");
  let gameResult;
  if (game.state === GameStates.FINISHED) {
    gameResult = calculateSips(
      bets,
      data.map((p) => {
        return {
          player_id: p.player_id,
          call_option_used: p.call_option_used ?? false,
          call_option_asset: bets?.find(
            (b) => b.player === p.player_id && b.type === TradeType.CALL
          )?.asset as AssetType | undefined,
        };
      }),
      {
        gold: game.gold_pos ?? 0,
        bonds: game.bonds_pos ?? 0,
        stocks: game.stocks_pos ?? 0,
        crypto: game.crypto_pos ?? 0,
      },
      game
    );
  }
  return { players: data, bets: bets, game: game, result: gameResult };
}

export default function Game({ loaderData, params }: Route.ComponentProps) {
  const { gameId } = params;
  const supabase = createClient();
  const { players, bets, game, result } = loaderData;
  const [investors, setInvestors] = useState<Investor[]>(players);
  const [investorBets, setInvestorBets] = useState<Bet[]>(bets);
  const [assets, setAssets] = useState<currentAssets>({
    gold: {
      position: game.gold_pos ?? 0,
      lastChange: 0,
      currentTrendSum: 0,
      asset: AssetType.GOLD,
    },
    bonds: {
      position: game.bonds_pos ?? 0,
      lastChange: 0,
      currentTrendSum: 0,
      asset: AssetType.BONDS,
    },
    stocks: {
      position: game.stocks_pos ?? 0,
      lastChange: 0,
      currentTrendSum: 0,
      asset: AssetType.STOCKS,
    },
    crypto: {
      position: game.crypto_pos ?? 0,
      lastChange: 0,
      currentTrendSum: 0,
      asset: AssetType.CRYPTO,
    },
  });
  const [gameState, setGameState] = useState<GameStates>(
    game.state as GameStates
  );

  const [marketEventCards, setMarketEventCards] = useState<MarketEventCard[]>(
    // TODO: fix hacky solution
    game.market_events.map((item) => JSON.parse(item as unknown as string))
  );

  const [isCallOptionBannerVisible, setCallOptionBannerVisible] =
    useState<boolean>(false);
  const [hasShownCallOptions, setHasShownCallOptions] =
    useState<boolean>(false);

  const handleCloseBanner = useCallback(() => {
    setCallOptionBannerVisible(false);
    setHasShownCallOptions(true);
  }, []);

  const updateAssetObject = (
    currentAssets: currentAssets,
    changes: AssetChange[]
  ) => {
    const tmp = { ...currentAssets };
    for (const item of changes) {
      const currentValue = tmp[item.asset];
      const updatedPosValue = currentValue.position + item.change;
      tmp[item.asset] = {
        ...currentValue,
        position: Math.max(updatedPosValue, 0),
        lastChange: item.change,
        currentTrendSum: calculateNewTrend(
          currentValue.currentTrendSum,
          item.change
        ),
      };
    }
    return tmp;
  };

  const updateAssetsByN = (
    changes: number,
    currentObject: currentAssets
  ): currentAssets => {
    const updated = { ...currentObject };

    for (const asset in currentObject) {
      const assetKey = asset as AssetType;
      const newValue = Math.max(0, currentObject[assetKey].position + changes);
      updated[assetKey] = { ...currentObject[assetKey], position: newValue };
    }
    return updated;
  };
  const handleNewGameEvent = useCallback(
    async (latestEvent: Event) => {
      const eventType = latestEvent.event;
      if (eventType === newMarketDay && gameState === GameStates.IN_PROGRESS) {
        const payload = latestEvent.payload as NewMarketDayPayload;
        const updatedAssets = updateAssetObject({ ...assets }, payload.changes);
        setAssets(() => updatedAssets);
        setTimeout(() => checkValidGameState(updatedAssets), 1000);
      }
      if (eventType === game_state) {
        if (gameState !== GameStates.FINISHED) {
          const { error } = await supabase
            .from("game")
            .update({ state: latestEvent.payload.nextState })
            .eq("game_id", gameId);
          if (error) {
            console.error(error);
          }
          setGameState(latestEvent.payload.nextState as GameStates);
        }
      }
      if (eventType === player_joined) {
        const payload = latestEvent.payload as BaseEvent;
        setInvestors((investors) => [
          {
            call_option_used: false,
            created_at: new Date().toISOString(),
            game_id: game.game_id,
            nickname: payload.nickname ?? "No Name",
            player_id: payload.playerId,
            put_option_used: false,
          },
          ...investors,
        ]);
      }
      if (eventType === bet_placed) {
        const payload = latestEvent.payload as BetPlacedPayload;
        setInvestorBets((IB) => [
          {
            amount: payload.amount,
            asset: payload.asset,
            created_at: new Date().toISOString(),
            game: game.game_id,
            player: payload.playerId,
            put_option_player: payload.put_option_player ?? null,
            type: payload.type,
          },
          ...IB,
        ]);
      }
    },
    [setAssets, setGameState, gameState, assets, setInvestorBets, setInvestors]
  );

  const { events, isConnected } = useRealtimeGame({
    gameId: gameId,
    onNewEvent: handleNewGameEvent,
  });

  const columns = 100;

  const showEvent = (event: MarketEventCard) => {
    setCurrentMarketEvent(event);
    setIsMarketDialogVisible(true);
  };

  const checkValidGameState = useCallback(
    async (currentAssetState: currentAssets) => {
      // Check if game is finished
      for (const assetName in currentAssetState) {
        const assetValue = currentAssetState[assetName as AssetType];
        if (assetValue.position > 100) {
          const { error } = await supabase
            .from("game")
            .update({
              state: GameStates.FINISHED,
              gold_pos: currentAssetState.gold.position,
              crypto_pos: currentAssetState.crypto.position,
              bonds_pos: currentAssetState.bonds.position,
              stocks_pos: currentAssetState.stocks.position,
            })
            .eq("game_id", gameId);
          setGameState(GameStates.FINISHED);
          window.location.reload();
        }
      }

      // Check if some market Events is passed
      const max = getLeadingAsset(Object.values(currentAssetState));
      const current = [...marketEventCards];
      const updated: MarketEventCard[] = [];
      let tempAssets = { ...currentAssetState };
      for (const marketEvent of current) {
        if (!marketEvent.isFlipped && max.position >= marketEvent.position) {
          updated.push({
            ...marketEvent,
            isFlipped: true,
          });
          showEvent(marketEvent);
          if (marketEvent.valueAll !== 0) {
            tempAssets = updateAssetsByN(marketEvent.valueAll, tempAssets);
          } else {
            tempAssets = updateAssetObject(tempAssets, marketEvent.changes);
          }
        } else {
          updated.push(marketEvent);
        }
      }

      setAssets(() => tempAssets);
      setMarketEventCards(() => updated);
      const { error } = await supabase
        .from("game")
        .update({
          gold_pos: tempAssets.gold.position,
          crypto_pos: tempAssets.crypto.position,
          bonds_pos: tempAssets.bonds.position,
          stocks_pos: tempAssets.stocks.position,
          market_events: updated.map((item) => JSON.stringify(item)),
        })
        .eq("game_id", gameId);
      const currentMax = getLeadingAsset(Object.values(currentAssetState));
      if (game.call_percent && currentMax.position > game.call_percent) {
        setCallOptionBannerVisible(true);
      }
    },
    [setAssets, setGameState, showEvent, setCallOptionBannerVisible]
  );

  const [currentMarketEvent, setCurrentMarketEvent] =
    useState<MarketEventCard | null>(null);
  const [isMarketDialogVisible, setIsMarketDialogVisible] =
    useState<boolean>(false);

  const handleCloseDialog = useCallback(() => {
    setIsMarketDialogVisible(false);
    // Optionally clear currentEvent after fade out animation is complete
    // setTimeout(() => setCurrentEvent(null), 500); // Match transition duration
  }, []);

  return (
    // Add wawy background here :D
    <WavyBackground
      backgroundFill="white"
      speed="fast"
      className="w-full h-[calc(100vh-2rem)] flex flex-col px-4"
    >
      <div className="flex flex-1 gap-2 overflow-hidden">
        {/* Asset cards on the left */}
        <div className="w-76 flex-shrink-0">
          <AssetCards assets={assets} bets={investorBets} />
        </div>

        {/* Main board area */}
        <div className="flex-1 flex flex-col">
          {/* Market event cards at the top */}
          <div className="mb-1">
            <MarketEventCards
              marketEventCards={marketEventCards}
              columns={columns}
            />
          </div>

          {/* Asset grid in the center */}
          <div className="flex-1">
            <AssetGrid
              gameState={gameState}
              columns={columns}
              assets={assets}
              marketEventCards={marketEventCards}
            />
          </div>
        </div>

        {/* Market events on the right */}
        <div className="w-[450px] flex-shrink-0">
          <MarketEvents events={events} />
        </div>
      </div>

      {/* Investor section at the bottom */}
      <div className="mt-2">
        <InvestorSection
          investors={investors}
          bets={investorBets}
          game={game}
        />
      </div>
      <MarketEventDialog
        eventData={currentMarketEvent}
        isVisible={isMarketDialogVisible}
        onClose={handleCloseDialog}
      />

      <GameResultsDialog
        open={gameState === GameStates.FINISHED}
        result={result}
        players={investors}
      />
      <CallOptionReminderBanner
        isVisible={isCallOptionBannerVisible && !hasShownCallOptions}
        onClose={handleCloseBanner}
      />
    </WavyBackground>
  );
}
