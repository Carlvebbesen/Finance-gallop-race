import {
  ASSET_COLORS,
  GameStates,
  type AssetType,
  type MarketEventCard,
} from "~/lib/eventTypes";
import type { AssetStateValue } from "~/routes/game.client";
import { Overlay } from "../backgrounds/overlay";

interface AssetGridProps {
  columns: number;
  assets: Record<AssetType, AssetStateValue>;
  marketEventCards: MarketEventCard[];
  gameState: GameStates;
}

function generateTrailForAsset(state: AssetStateValue, maxHeight: number) {
  const points: { x: number; y: number }[] = [];
  for (let i = 0; i <= state.position; i++) {
    const x = i * 10;
    const y = Math.random() * maxHeight;
    points.push({ x, y });
  }
  return points;
}

function getStrokeColor(trend: number) {
  if (trend > 0) {
    return "rgba(0, 200, 5, 0.6)";
  }
  if (trend < 0) {
    return "rgba(220, 38, 38, 0.6)";
  }
  return "rgba(59, 130, 246, 0.6)";
}

export default function AssetGrid({
  columns,
  assets,
  marketEventCards,
  gameState,
}: AssetGridProps) {
  // Create a 4x100 grid (or 4 x columns)

  const rows = 4;

  const graphHeight = 50;

  const assetGraphs = Object.entries(assets).reduce(
    (acc, [key, state], index) => {
      acc[key as AssetType] = generateTrailForAsset(state, graphHeight);
      return acc;
    },
    {} as Record<AssetType, { x: number; y: number }[]>
  );
  return (
    <div className="relative w-full h-full border border-gray-300">
      {gameState === GameStates.NOT_STARTED && (
        <Overlay message="Game Not Started " />
      )}
      {/* Grid bzckground */}
      <div className="absolute inset-0 grid grid-rows-4 w-full h-full">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={`row-${rowIndex}`} className="flex w-full h-full">
            {Array.from({ length: columns }).map((_, colIndex) => {
              // Check if there's a market event card at this position (for visual indication)
              const hasMarketEvent = marketEventCards.some(
                (card) => card.position === colIndex
              );

              // Add position markers every 10 columns
              const showMarker = colIndex % 10 === 0;

              return (
                <div
                  key={`cell-${rowIndex}-${colIndex}`}
                  className={`border-0 ${
                    hasMarketEvent
                      ? "bg-purple-100"
                      : showMarker
                      ? "bg-gray-50"
                      : ""
                  }`}
                  style={{ width: `${100 / columns}%`, height: "100%" }}
                >
                  {showMarker && (
                    <div className="text-[6px] text-gray-400 absolute bottom-0">
                      {colIndex}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
      {/* Asset trailing */}
      {Object.entries(assets).map(([key, assetState], index) => {
        const trailPoints = assetGraphs[key as AssetType];
        const assetTop = (index * 100) / rows + 100 / rows / 2;

        const path = trailPoints
          .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
          .join(" ");

        return (
          <svg
            key={`graph-${key}`}
            className="absolute"
            width={(assetState.position + 1) * 10}
            height={graphHeight}
            style={{
              left: `0%`,
              top: `calc(${assetTop}% - ${graphHeight / 2}px)`,
              zIndex: 1,
              overflow: "visible",
            }}
          >
            <path
              d={path}
              fill="none"
              stroke={getStrokeColor(assetState.currentTrendSum)}
              strokeWidth="5"
            />
          </svg>
        );
      })}

      {/* Asset markers (positioned absolutely) */}
      {Object.keys(assets).map((key, index) => (
        <img
          key={`asset-${key} ${index}`}
          alt={key}
          width="100px"
          height="100px"
          src={`/assets/${key}.png`}
          className={`absolute ${
            ASSET_COLORS[key as AssetType]
          } rounded-full border-black border-2`}
          style={{
            left: `calc(${
              (assets[key as AssetType].position * 100) / columns
            }% - 50px)`,
            top: `calc(${(index * 100) / rows}% + ${100 / rows / 2}% - 50px)`,
            transition: "left 0.5s ease-out",
            zIndex: 10,
          }}
        />
      ))}

      {/* Market event indicators */}
      {marketEventCards.map((card) => (
        <div
          key={`event-marker-${card.id}`}
          className="absolute w-1 bg-purple-500"
          style={{
            left: `calc(${(card.position * 100) / columns}%)`,
            top: 0,
            bottom: 0,
            zIndex: 5,
          }}
        ></div>
      ))}
    </div>
  );
}
