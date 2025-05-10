import { useState, useEffect } from "react";
import type { MarketEventCard } from "~/lib/eventTypes";

// --- MarketEventDialog Component ---
export const MarketEventDialog = ({
  eventData,
  isVisible,
  onClose,
}: {
  eventData: MarketEventCard | null;
  isVisible: boolean;
  onClose: () => void;
}) => {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (isVisible) {
      setProgress(100); // Reset progress when dialog becomes visible
      let timeLeft = 10000; // 10 seconds
      const updateInterval = 100; // Update every 100ms

      const progressTimer = setInterval(() => {
        timeLeft -= updateInterval;
        setProgress((timeLeft / 10000) * 100);
        if (timeLeft <= 0) {
          clearInterval(progressTimer);
        }
      }, updateInterval);

      const closeTimer = setTimeout(() => {
        onClose();
      }, 10000);

      // Cleanup function
      return () => {
        clearTimeout(closeTimer);
        clearInterval(progressTimer);
      };
    }
  }, [isVisible, onClose, eventData]); // Added eventData to dependencies to reset timer if event changes while visible

  if (!isVisible || !eventData) {
    return null;
  }

  // Determine title and description from event text
  const sentences = eventData.text.match(/[^.!?]+[.!?]+/g) || [eventData.text];
  const title = sentences[0] || "Market Event!";
  const description =
    sentences.length > 1
      ? sentences.slice(1).join(" ").trim()
      : sentences[0] === eventData.text
      ? ""
      : eventData.text;
  const fallbackDescription =
    description.length === 0 && sentences[0] !== eventData.text
      ? eventData.text
      : description;

  return (
    <div
      className={`fixed top-[5vh] left-1/2 -translate-x-1/2 w-[80vw] max-w-8/12 min-h-[50vh] bg-white rounded-2xl shadow-2xl z-[1000] overflow-hidden flex flex-col transition-opacity duration-500 ease-in-out ${
        isVisible
          ? "opacity-100 translate-y-0"
          : "opacity-0 -translate-y-5 pointer-events-none"
      }`}
    >
      <div className="p-8 md:p-10 flex-grow flex flex-col items-center text-center">
        <div className="w-24 h-24 mb-6">
          <img alt={eventData.type} src={`/assets/${eventData.type}.png`} />
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-800 mb-4 leading-tight">
          {title}
        </h2>
        {fallbackDescription && (
          <p className="text-lg sm:text-xl md:text-2xl text-gray-600 mb-6 max-h-[150px] overflow-y-auto">
            {fallbackDescription}
          </p>
        )}

        <div className="text-xl sm:text-2xl md:text-3xl font-semibold w-full">
          {eventData.valueAll !== 0 ? (
            <div
              className={`p-2 rounded-lg bg-gray-100 ${
                eventData.valueAll > 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              All Assets:{" "}
              {eventData.valueAll > -1 &&
              eventData.valueAll < 1 &&
              eventData.valueAll !== 0
                ? `${(eventData.valueAll * 100).toFixed(0)}%`
                : `${eventData.valueAll > 0 ? "+" : ""}${eventData.valueAll}`}
            </div>
          ) : eventData.changes && eventData.changes.length > 0 ? (
            eventData.changes.map((change, index) => (
              <div
                key={index}
                className={`mb-2 p-2 rounded-lg bg-gray-100 ${
                  change.change > 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {change.asset.charAt(0).toUpperCase() + change.asset.slice(1)}:{" "}
                {change.change > 0 ? "+" : ""}
                {change.change}
              </div>
            ))
          ) : (
            <p className="text-gray-500">No specific changes detailed.</p>
          )}
        </div>
      </div>
      <div className="w-full h-2.5 bg-gray-200 absolute bottom-0 left-0">
        <div
          className="h-full bg-blue-500"
          style={{ width: `${progress}%`, transition: "width 0.1s linear" }}
        ></div>
      </div>
    </div>
  );
};
