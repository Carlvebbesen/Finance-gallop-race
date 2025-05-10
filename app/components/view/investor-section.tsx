import type { Bet, Game, Investor } from "~/routes/game.client";
import { Card, CardContent } from "../ui/card";
import { TradeType } from "~/lib/eventTypes";
import { calculateTotalSipsToDrink, totalSipsToDrink } from "~/lib/utils";
import type { Database } from "database.types";

interface InvestorSectionProps {
  investors: Investor[];
  bets: Bet[];
  game: Game;
}

// --- Helper Function to process bets ---

interface ProcessedBetInfo {
  totalAmount: number;
  assets: string[]; // List of unique assets for this bet type
}

const processBetsForType = (
  bets: Bet[],
  type: TradeType,
  investorId: string
): ProcessedBetInfo => {
  const relevantBets = bets.filter(
    (bet) => bet.type === type && investorId === bet.player
  );
  const totalAmount = relevantBets.reduce((sum, bet) => sum + bet.amount, 0);
  const assets = Array.from(new Set(relevantBets.map((bet) => bet.asset))); // Unique assets
  return { totalAmount, assets };
};

export default function InvestorSection({
  investors,
  bets,
  game,
}: InvestorSectionProps) {
  if (!investors || investors.length === 0) {
    return (
      <div className="w-full py-4">
        <h2 className="text-xl font-bold mb-2 text-gray-700">Investors</h2>
        <p className="text-gray-500">
          No investor data available at the moment.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full py-4">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800">
        Meet the Investors
      </h2>
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">
        {investors.map((investor) => {
          const shortInfo = processBetsForType(
            bets,
            TradeType.SHORT,
            investor.player_id
          );
          const callInfo = processBetsForType(
            bets,
            TradeType.CALL,
            investor.player_id
          );
          const normalInvestInfo = processBetsForType(
            bets,
            TradeType.INVEST,
            investor.player_id
          );

          return (
            <Card
              key={investor.player_id}
              className="min-w-[300px] max-w-[400px] flex-shrink-0 bg-slate-50 hover:shadow-lg transition-shadow duration-200"
            >
              <CardContent>
                <div className="flex items-baseline justify-around">
                  <h3
                    className="font-bold text-lg text-indigo-700 truncate"
                    title={investor.nickname ?? "No Name"}
                  >
                    {investor.nickname}
                  </h3>
                  <h3 className="underline">Drink PreGame: </h3>
                  <h2 className="text-3xl font-semibold">
                    {totalSipsToDrink(
                      game,
                      bets.filter((b) => b.player === investor.player_id)
                    )}
                  </h2>
                </div>
                <div className="mt-3 space-y-3">
                  {/* Display Short Bets */}
                  {shortInfo.totalAmount > 0 && (
                    <div>
                      <p className="text-sm font-semibold text-red-600">
                        Shorted:{" "}
                        <span className="font-bold">
                          {shortInfo.totalAmount} sips
                        </span>
                      </p>
                      {shortInfo.assets.length > 0 && (
                        <p className="text-xs text-gray-600">
                          Assets: {shortInfo.assets.join(", ")}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Display Call Bets (assuming "call" is a type) */}
                  {callInfo.totalAmount > 0 && (
                    <div>
                      <p className="text-sm font-semibold text-green-600">
                        Calls:{" "}
                        <span className="font-bold">
                          {callInfo.totalAmount} sips
                        </span>
                      </p>
                      {callInfo.assets.length > 0 && (
                        <p className="text-xs text-gray-600">
                          Assets: {callInfo.assets.join(", ")}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Display Normal Investments (assuming type "invest") */}
                  {normalInvestInfo.totalAmount > 0 && (
                    <div>
                      <p className="text-sm font-semibold text-blue-600">
                        Invested:{" "}
                        <span className="font-bold">
                          {normalInvestInfo.totalAmount} sips
                        </span>
                      </p>
                      {normalInvestInfo.assets.length > 0 && (
                        <p className="text-xs text-gray-600">
                          Assets: {normalInvestInfo.assets.join(", ")}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Fallback if no relevant bets are displayed */}
                  {shortInfo.totalAmount === 0 &&
                    callInfo.totalAmount === 0 &&
                    normalInvestInfo.totalAmount === 0 && (
                      <p className="text-sm text-gray-500">
                        No active short, call, or standard investments.
                      </p>
                    )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
