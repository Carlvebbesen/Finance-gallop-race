import { ASSET_COLORS, ASSET_LABELS, type AssetType } from "~/lib/eventTypes";
import { Card, CardContent } from "../ui/card";
import type { AssetStateValue, Bet } from "~/routes/game.client";

interface AssetCardsProps {
  assets: Record<AssetType, AssetStateValue>;
  bets: Bet[];
}

export default function AssetCards({ assets, bets }: AssetCardsProps) {
  // Helper function to count bets for a specific asset
  const countBetsForAsset = (assetKey: AssetType): number => {
    if (!bets) return 0;
    return bets.filter((bet) => bet.asset === assetKey).length;
  };

  // Get the list of asset keys to map over
  const assetKeys = Object.keys(assets) as AssetType[];

  return (
    <div className="flex flex-col h-full gap-3">
      <h2 className="text-3xl font-semibold mb-3 text-gray-800">
        Financial Asset Race
      </h2>
      {assetKeys.map((assetKey) => {
        const assetState = assets[assetKey];
        const numberOfBets = countBetsForAsset(assetKey);
        const growthColor =
          assetState.position >= 0 ? "text-green-500" : "text-red-500";
        const changeColor =
          assetState.lastChange >= 0 ? "text-emerald-500" : "text-rose-500";

        return (
          <Card
            key={assetKey}
            className={`flex-1 ${ASSET_COLORS[assetKey]} text-white rounded-xl shadow-lg overflow-hidden`}
          >
            <CardContent>
              <div className="flex flex-col justify-between h-full">
                <div>
                  <h3
                    className="font-bold text-2xl flex items-center justify-start gap-2 mb-1 truncate"
                    title={ASSET_LABELS[assetKey]}
                  >
                    <span>{ASSET_LABELS[assetKey]}</span>
                  </h3>
                  <div className="text-2xl mb-2">
                    {numberOfBets > 0 ? (
                      <span className="bg-white/20 px-2 py-0.5 rounded-full">
                        {numberOfBets} active bet{numberOfBets !== 1 ? "s" : ""}
                      </span>
                    ) : (
                      <span className="text-white/70">No active bets</span>
                    )}
                  </div>
                </div>

                <div className="mt-1 text-left space-y-1">
                  <p className="text-xl">
                    <span className="font-medium opacity-80">Growth: </span>
                    <span className={`font-bold ${growthColor}`}>
                      {assetState.position >= 0 ? "+" : ""}
                      {assetState.position.toFixed(2)}%
                    </span>
                  </p>
                  <p className="text-xl">
                    <span className="font-medium opacity-80">
                      Last Change:{" "}
                    </span>
                    <span className={`font-bold ${changeColor}`}>
                      {assetState.lastChange >= 0 ? "+" : ""}
                      {assetState.lastChange.toFixed(2)}%
                    </span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
