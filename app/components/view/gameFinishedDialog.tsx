import { Trophy, TrendingDown, TrendingUp, Users, Link } from "lucide-react";
import { ASSET_COLORS } from "~/lib/event";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Card, CardContent } from "../ui/card";
import type { Investor, SipCalculationResult } from "~/types";
import { Button } from "../ui/button";
import { useNavigate } from "react-router";
import { AutoScroll } from "../AutoScrollList";

export default function GameResultsDialog({
  open,
  result,
  players,
}: {
  open: boolean;
  players: Investor[];
  result?: SipCalculationResult | null;
}) {
  if (!result) return <div>{open ? "Loading ...." : ""}</div>;
  const navigate = useNavigate();
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
      <DialogContent className="min-w-10/12 h-[95vh] flex flex-col p-6 rounded-xl">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-center flex justify-center items-center text-5xl font-bold">
            Market Race Results{" "}
            <Button className="ml-10" onClick={() => navigate("/")}>
              Exit Market
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col h-full">
          {/* Top section with winner and investor results */}
          <div className="flex gap-4 h-[60%]">
            {/* Left column - Winner and successful investors */}
            <div className="flex flex-col gap-4 w-1/2">
              <div className="flex items-center gap-4 bg-yellow-50 p-4 rounded-xl border-2 border-yellow-200">
                <Trophy className="h-20 w-20 text-yellow-500" />
                <div className="flex flex-col items-center">
                  <h2 className="text-3xl font-bold">
                    Winning Asset:{" "}
                    {result.winningAssets.join(" , ").toUpperCase()}
                  </h2>
                  {result.winningAssets.map((asset) => (
                    <img
                      className="w-40 rounded border-4 border-amber-400 mt-5"
                      alt={asset}
                      src={`/assets/${asset}.png`}
                    />
                  ))}
                </div>
              </div>

              {/* Winning Investors */}
              <Card className="shadow-lg flex-1 overflow-hidden py-2">
                <CardContent className="h-full flex flex-col">
                  <div className="flex items-center gap-3 mb-3">
                    <TrendingUp className="h-6 w-6 text-green-500" />
                    <h3 className="text-2xl font-bold">Successful Investors</h3>
                  </div>

                  <div className="flex-1 overflow-hidden">
                    {result.successfulInvestments.length > 0 ? (
                      <AutoScroll className="h-full" direction="vertical">
                        {result.successfulInvestments.map((investor) => (
                          <div
                            key={`${investor.asset} ${investor.player}${investor.originalInvestedAmount}`}
                            className="flex items-center justify-between border-b py-2"
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-4 h-4 rounded-full ${
                                  ASSET_COLORS[investor.asset]
                                }`}
                              ></div>
                              <span className="font-medium text-2xl">
                                {players.find(
                                  (player) =>
                                    player.player_id === investor.player
                                )?.nickname ?? `No Name ${investor.player}`}
                              </span>
                            </div>
                            {investor.callOptionUsed && (
                              <h2 className="text-xl">Call Option Used!</h2>
                            )}
                            <div className="text-green-600 font-bold text-2xl">
                              Hand out: + {investor.sipsToDeal}
                            </div>
                          </div>
                        ))}
                      </AutoScroll>
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
              <Card className="shadow-lg flex-1 overflow-hidden py-2">
                <CardContent className="p-4 h-full flex flex-col">
                  <div className="flex items-center gap-3 mb-3">
                    <TrendingDown className="h-8 w-8 text-green-500" />
                    <h3 className="text-2xl font-bold">Successful Shorts</h3>
                  </div>

                  <div className="flex-1 overflow-hidden">
                    {result.successfulShorts.length > 0 ? (
                      <AutoScroll className="h-full" direction="vertical">
                        {result.successfulShorts.map((investor) => (
                          <div
                            key={`${investor.asset} ${investor.player}${investor.amount}`}
                            className="flex items-center justify-between border-b py-2"
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-4 h-4 rounded-full ${
                                  ASSET_COLORS[investor.asset]
                                }`}
                              ></div>
                              <span className="font-medium text-2xl">
                                {players.find(
                                  (player) =>
                                    player.player_id === investor.player
                                )?.nickname ?? `No Name ${investor.player}`}
                              </span>
                              <span className="text-sm text-gray-500">
                                (Shorted {investor.asset})
                              </span>
                            </div>
                            <div className="text-green-600 font-bold text-2xl">
                              Hand out: + {investor.sipsToDeal}
                            </div>
                          </div>
                        ))}
                      </AutoScroll>
                    ) : (
                      <p className="text-gray-500 italic text-lg">
                        No successful shorts
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Unsuccessful Shorts */}
              <Card className="shadow-lg flex-1 overflow-hidden py-3">
                <CardContent className="h-full flex flex-col">
                  <div className="flex items-center gap-3 mb-3">
                    <TrendingDown className="h-8 w-8 text-red-500" />
                    <h3 className="text-2xl font-bold">Unsuccessful Shorts</h3>
                  </div>

                  <div className="flex-1 overflow-hidden">
                    {result.unsuccessfulShorts.length > 0 ? (
                      <AutoScroll direction="vertical" className="h-full">
                        {result.unsuccessfulShorts.map((investor) => (
                          <div
                            key={`${investor.asset} ${investor.player}${investor.amount}`}
                            className="flex items-center justify-between border-b py-2"
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-4 h-4 rounded-full ${
                                  ASSET_COLORS[investor.asset]
                                }`}
                              ></div>
                              <span className="font-medium text-2xl">
                                {players.find(
                                  (player) =>
                                    player.player_id === investor.player
                                )?.nickname ?? `No Name ${investor.player}`}
                              </span>
                              <span className="text-sm text-gray-500">
                                (Shorted {investor.asset})
                              </span>
                            </div>
                            <div className="text-red-600 font-bold text-2xl">
                              Needs to drink: {investor.sipsToDrink}
                            </div>
                          </div>
                        ))}
                      </AutoScroll>
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
          <Card className="shadow-lg mt-4 flex-1 py-3">
            <CardContent className="p-2 h-full">
              <div className="flex items-center gap-3 mb-3">
                <Users className="h-8 w-8" />
                <h3 className="text-2xl font-bold">Our Investors</h3>
              </div>
              <AutoScroll>
                {result.playerSipSummary.map((investor, index) => {
                  const player = players.find(
                    (player) => player.player_id === investor.player
                  );
                  return (
                    <div
                      className={`min-w-55 border rounded-xl p-4 mx-2 inline-block shadow-lg
  ${
    investor.sipsToDealOut > 0
      ? "bg-gradient-to-br from-green-200 to-green-400"
      : "bg-gradient-to-br from-red-200 to-red-400"
  }`}
                    >
                      <span className="font-bold text-2xl">
                        #{index + 1}:{" "}
                        {player?.nickname ?? `No Name ${investor.player}`}
                      </span>

                      <div className="my-2">
                        <h3 className="text-2xl">
                          🍻 Drink:{" "}
                          <span className="font-bold">
                            {investor.sipsToDrink}
                          </span>
                        </h3>
                        <h3 className="text-2xl">
                          🤟 Hand Out:{" "}
                          <span className="font-bold">
                            {investor.sipsToDealOut}
                          </span>
                        </h3>
                      </div>
                    </div>
                  );
                })}
              </AutoScroll>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
