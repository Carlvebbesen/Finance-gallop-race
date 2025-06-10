import { totalSipsToDrink } from "~/lib/utils";
import { type Investor, type Bet, type Game, TradeType } from "~/types";
import { Card, CardContent } from "../ui/card";
import { AutoScroll } from "../AutoScrollList";
import type { ReactNode } from "react";

interface InvestorSectionProps {
  investors: Investor[];
  bets: Bet[];
  game: Game;
  readyPlayers: string[];
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
    (bet) => bet.type === type && investorId === bet.player_id
  );
  const totalAmount = relevantBets.reduce((sum, bet) => sum + bet.amount, 0);
  const assets = Array.from(new Set(relevantBets.map((bet) => bet.asset))); // Unique assets
  return { totalAmount, assets };
};

export default function InvestorSection({
  investors,
  bets,
  game,
  readyPlayers,
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
      <AutoScroll speed={55}>
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
          const isReady = readyPlayers.includes(investor.player_id);
          return (
            <Card
              key={investor.player_id}
              className={`min-w-65 transition-shadow duration-300 mx-4 p-1
    ${
      isReady
        ? "animate-drinkCelebrate bg-green-100"
        : "bg-slate-50 hover:shadow-lg"
    }
  `}
            >
              <CardContent className=" flex flex-col items-start justify-center">
                <h3 className="font-bold text-2xl text-indigo-700 truncate">
                  {investor.nickname ?? "No Name"}
                </h3>
                <h2
                  className={`text-2xl text-amber-600 font-semibold transition-opacity duration-500 ${
                    isReady ? "opacity-0" : "opacity-100"
                  }`}
                >
                  Invested Sips:{" "}
                  {totalSipsToDrink(
                    game,
                    bets.filter((b) => b.player_id === investor.player_id)
                  )}
                </h2>
                <div className="mt-3 space-y-3">
                  {shortInfo.totalAmount > 0 && (
                    <InvestorInvestments assets={shortInfo.assets}>
                      <p className="text-lg font-semibold text-red-600">
                        Shorted:{" "}
                        <span className="font-bold">
                          {shortInfo.totalAmount} sips
                        </span>
                      </p>
                    </InvestorInvestments>
                  )}

                  {callInfo.totalAmount > 0 && (
                    <InvestorInvestments assets={callInfo.assets}>
                      <p className="text-lg font-semibold text-green-600">
                        Calls:{" "}
                        <span className="font-bold">
                          {callInfo.totalAmount} sips
                        </span>
                      </p>
                    </InvestorInvestments>
                  )}

                  {normalInvestInfo.totalAmount > 0 && (
                    <InvestorInvestments assets={normalInvestInfo.assets}>
                      <p className="text-lg font-semibold text-blue-600">
                        Invested:{" "}
                        <span className="font-bold">
                          {normalInvestInfo.totalAmount} sips
                        </span>
                      </p>
                    </InvestorInvestments>
                  )}

                  {shortInfo.totalAmount === 0 &&
                    callInfo.totalAmount === 0 &&
                    normalInvestInfo.totalAmount === 0 && (
                      <p className="text-lg text-gray-500">
                        No active short, call, or standard investments.
                      </p>
                    )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </AutoScroll>
    </div>
  );
}
const InvestorInvestments = ({
  assets,
  children,
}: {
  assets: string[];
  children: ReactNode;
}) => {
  return (
    <div className="flex space-x-2 items-center">
      <img
        key={`asset-${assets[0]} ${children?.toString()}`}
        alt={assets[0]}
        src={`/assets/${assets[0]}.png`}
        className="rounded-full h-8"
      />
      <div>
        {children}
        {assets.length > 0 && (
          <p className="text-sm text-gray-600">On: {assets.join(", ")}</p>
        )}
      </div>
    </div>
  );
};
