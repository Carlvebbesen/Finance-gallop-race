import { HelpCircleIcon } from "lucide-react";
import { MarketEventType, type MarketEventCard } from "~/lib/eventTypes";
interface MarketEventCardsProps {
  marketEventCards: MarketEventCard[];
  columns: number;
}
export default function MarketEventCards({
  marketEventCards,
  columns,
}: MarketEventCardsProps) {
  const cardBaseClasses =
    "w-28 h-28 rounded-lg flex items-center justify-center cursor-pointer shadow-xl"; // Increased size and shadow
  const cardFaceClasses =
    "absolute w-full h-full backface-hidden flex items-center justify-center overflow-hidden rounded-lg"; // Matched rounded-lg

  return (
    <div className="w-full">
      <div className="relative h-32 w-full border border-gray-300 rounded-md">
        {Array.from(
          { length: Math.floor(columns / 10) + 1 },
          (_, i) => i * 10
        ).map((position) => (
          <div
            key={`marker-${position}`}
            className="absolute bottom-0.5 text-lg text-gray-600 font-medium" // Adjusted bottom and text style
            style={{
              left: `${Math.min((position * 100) / columns, 100)}%`,
              transform:
                position === 0 ? "translateX(2px)" : "translateX(-50%)", // Fine-tune first marker for aesthetics
            }}
          >
            {position}
          </div>
        ))}
        {/* Market event cards */}
        {marketEventCards.map((card) => (
          <div
            key={card.id}
            className="absolute"
            style={{
              left: `${(card.position * 100) / columns}%`,
              top: "50%", // Center vertically in the h-16 bar
              transform: "translate(-50%, -50%)", // Center the card on its position
              perspective: "1000px", // For 3D flip effect
            }}
          >
            <div
              className={`${cardBaseClasses} transform-style-preserve-3d transition-transform duration-700 ease-in-out ${
                card.isFlipped ? "rotate-y-180" : ""
              }`}
            >
              <div
                className={`${cardFaceClasses} bg-purple-600 hover:bg-purple-700 text-white rotate-y-0 flex flex-col gap-4`}
              >
                <HelpCircleIcon />
                <h1>{card.position}</h1>
              </div>
              <div
                className={`${cardFaceClasses} ${
                  card.type === MarketEventType.BULL
                    ? "bg-green-500 hover:bg-green-600"
                    : card.type === MarketEventType.BEAR
                    ? "bg-red-500 hover:bg-red-600"
                    : "bg-blue-500 hover:bg-blue-600"
                } text-white rotate-y-180`}
              >
                {card.type === MarketEventType.BULL && (
                  <img alt="bull-market" src="/assets/bull.png" height={50} />
                )}
                {card.type === MarketEventType.BEAR && (
                  <img height={50} alt="bear market" src="/assets/bear.png" />
                )}
                {card.type === MarketEventType.BOOM && (
                  <img height={50} alt="explosion" src="/assets/boom.png" />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
