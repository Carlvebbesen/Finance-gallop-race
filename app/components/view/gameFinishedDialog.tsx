import { Trophy, TrendingDown, TrendingUp, Users } from "lucide-react";
import { ASSET_COLORS } from "~/lib/eventTypes";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Card, CardContent } from "../ui/card";
import type { SipCalculationResult } from "~/lib/utils";
import type { Investor } from "~/routes/game.client";

export default function GameResultsDialog({
  open,
  result,
  players,
}: {
  open: boolean;
  players: Investor[];
  result?: SipCalculationResult | null;
}) {
  // Calculate dynamic grid columns based on number of investors

  if (!result) return <div>{open ? "Loading ...." : ""}</div>;
  const getInvestorGridCols = () => {
    const count = result.playerSipSummary.length;
    if (count <= 4) return "grid-cols-4";
    if (count <= 6) return "grid-cols-6";
    if (count <= 8) return "grid-cols-8";
    if (count <= 10) return "grid-cols-10";
    return "grid-cols-12"; // For very large numbers
  };

  return (
    <Dialog open={open}>
      <DialogContent className="min-w-8/12 h-[95vh] flex flex-col p-6 rounded-xl">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-center text-5xl font-bold">
            Market Race Results
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col h-full">
          {/* Top section with winner and investor results */}
          <div className="flex gap-4 h-[60%]">
            {/* Left column - Winner and successful investors */}
            <div className="flex flex-col gap-4 w-1/2">
              {/* Winner Section */}
              <div className="flex items-center gap-4 bg-yellow-50 p-4 rounded-xl border-2 border-yellow-200">
                <Trophy className="h-20 w-20 text-yellow-500" />
                <h2 className="text-3xl font-bold">
                  Winning Asset:{" "}
                  {result.winningAssets.map((asset) => (
                    <div className="flex justify-around items-center w-40">
                      <img
                        height={40}
                        alt={asset}
                        src={`/assets/${asset}.png`}
                      />
                      <h3 className="text-xl font-semibold">
                        {asset.toUpperCase()}
                      </h3>
                    </div>
                  ))}
                </h2>
              </div>

              {/* Winning Investors */}
              <Card className="shadow-lg flex-1 overflow-hidden">
                <CardContent className="p-4 h-full flex flex-col">
                  <div className="flex items-center gap-3 mb-3">
                    <TrendingUp className="h-8 w-8 text-green-500" />
                    <h3 className="text-2xl font-bold">Successful Investors</h3>
                  </div>

                  <div className="flex-1 overflow-hidden">
                    {result.successfulInvestments.length > 0 ? (
                      <div className="grid grid-cols-1 gap-2 h-full">
                        {result.successfulInvestments.map((investor) => (
                          <div
                            key={`${investor.asset} ${investor.player}${investor.originalInvestedAmount}`}
                            className="flex items-center justify-between border-b pb-2"
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-4 h-4 rounded-full ${
                                  ASSET_COLORS[investor.asset]
                                }`}
                              ></div>
                              <span className="font-medium text-xl">
                                {players.find(
                                  (player) =>
                                    player.player_id === investor.player
                                )?.nickname ?? `No Name ${investor.player}`}
                              </span>
                            </div>
                            {investor.callOptionUsed && (
                              <h2 className="text-xl">Call Option Used!</h2>
                            )}
                            <div className="text-green-600 font-bold text-xl">
                              Hand out: + {investor.sipsToDeal}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 italic text-lg">
                        No investors bet on the winning asset
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right column - Shorts */}
            <div className="flex flex-col gap-4 w-1/2">
              {/* Successful Shorts */}
              <Card className="shadow-lg flex-1 overflow-hidden">
                <CardContent className="p-4 h-full flex flex-col">
                  <div className="flex items-center gap-3 mb-3">
                    <TrendingDown className="h-8 w-8 text-green-500" />
                    <h3 className="text-2xl font-bold">Successful Shorts</h3>
                  </div>

                  <div className="flex-1 overflow-hidden">
                    {result.successfulShorts.length > 0 ? (
                      <div className="grid grid-cols-1 gap-2 h-full">
                        {result.successfulShorts.map((investor) => (
                          <div
                            key={`${investor.asset} ${investor.player}${investor.amount}`}
                            className="flex items-center justify-between border-b pb-2"
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-4 h-4 rounded-full ${
                                  ASSET_COLORS[investor.asset]
                                }`}
                              ></div>
                              <span className="font-medium text-xl">
                                {players.find(
                                  (player) =>
                                    player.player_id === investor.player
                                )?.nickname ?? `No Name ${investor.player}`}
                              </span>
                              <span className="text-sm text-gray-500">
                                (Shorted {investor.asset})
                              </span>
                            </div>
                            <div className="text-green-600 font-bold text-xl">
                              Hand out: + {investor.sipsToDeal}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 italic text-lg">
                        No successful shorts
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Unsuccessful Shorts */}
              <Card className="shadow-lg flex-1 overflow-hidden">
                <CardContent className="p-4 h-full flex flex-col">
                  <div className="flex items-center gap-3 mb-3">
                    <TrendingDown className="h-8 w-8 text-red-500" />
                    <h3 className="text-2xl font-bold">Unsuccessful Shorts</h3>
                  </div>

                  <div className="flex-1 overflow-hidden">
                    {result.unsuccessfulShorts.length > 0 ? (
                      <div className="grid grid-cols-1 gap-2 h-full">
                        {result.unsuccessfulShorts.map((investor) => (
                          <div
                            key={`${investor.asset} ${investor.player}${investor.amount}`}
                            className="flex items-center justify-between border-b pb-2"
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-4 h-4 rounded-full ${
                                  ASSET_COLORS[investor.asset]
                                }`}
                              ></div>
                              <span className="font-medium text-xl">
                                {players.find(
                                  (player) =>
                                    player.player_id === investor.player
                                )?.nickname ?? `No Name ${investor.player}`}
                              </span>
                              <span className="text-sm text-gray-500">
                                (Shorted {investor.asset})
                              </span>
                            </div>
                            <div className="text-red-600 font-bold text-xl">
                              Needs to drink: {investor.sipsToDrink}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 italic text-lg">
                        No unsuccessful shorts
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* All Investors Section - Bottom */}
          <Card className="shadow-lg mt-4 flex-1">
            <CardContent className="p-4 h-full">
              <div className="flex items-center gap-3 mb-3">
                <Users className="h-8 w-8" />
                <h3 className="text-2xl font-bold">Our Investors</h3>
              </div>

              <div
                className={`grid ${getInvestorGridCols()} gap-3 h-[calc(100%-3rem)]`}
              >
                {result.playerSipSummary.map((investor, index) => {
                  // Calculate card size based on investor count
                  const textSize =
                    result.playerSipSummary.length <= 6
                      ? "text-2xl"
                      : "text-xl";
                  const numberSize =
                    result.playerSipSummary.length <= 6
                      ? "text-2xl"
                      : "text-xl";
                  return (
                    <div
                      key={`${investor.player} ${investor.sipsToDealOut}${investor.sipsToDrink} ${index}`}
                      className="border rounded-xl p-3 flex flex-col justify-between shadow-md"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={`font-bold ${numberSize}`}>
                          #{index + 1}
                        </span>
                        <span
                          className={`${
                            investor.sipsToDealOut === 0
                              ? "bg-red-100 text-red-700"
                              : "bg-green-100 text-green-700"
                          } text-xs px-2 py-0.5 rounded-full font-bold`}
                        >
                          {investor.sipsToDealOut === 0 ? "LOOSER" : "WINNER"}
                        </span>
                      </div>
                      <div className={`font-medium ${textSize}`}>
                        {players.find(
                          (player) => player.player_id === investor.player
                        )?.nickname ?? `No Name ${investor.player}`}
                      </div>
                      <div className="flex items-center gap-1 text-sm">
                        <h3 className={textSize}>To drink:</h3>
                        <h3 className={textSize}>{investor.sipsToDrink}</h3>
                      </div>
                      <h3 className="text-lg font-bold underline ">
                        To hand Out: {investor.sipsToDealOut}
                      </h3>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
