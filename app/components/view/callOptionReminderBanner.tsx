import { useEffect, useState } from "react";

// --- TypeScript Interfaces ---
interface CallOptionReminderBannerProps {
  isVisible: boolean;
  message?: string;
  onClose: () => void;
}

// --- CallOptionReminderBanner Component ---
export const CallOptionReminderBanner: React.FC<
  CallOptionReminderBannerProps
> = ({ isVisible, message, onClose }) => {
  const [progress, setProgress] = useState<number>(100);

  useEffect(() => {
    if (isVisible) {
      setProgress(100); // Reset progress when banner becomes visible
      let timeLeft = 15000; // 15 seconds
      const updateInterval = 100; // Update every 100ms

      const progressTimer = setInterval(() => {
        timeLeft -= updateInterval;
        setProgress(Math.max(0, (timeLeft / 15000) * 100));
        if (timeLeft <= 0) {
          clearInterval(progressTimer);
        }
      }, updateInterval);

      const closeTimer = setTimeout(() => {
        onClose();
      }, 15000);

      // Cleanup function
      return () => {
        clearTimeout(closeTimer);
        clearInterval(progressTimer);
      };
    }
  }, [isVisible, onClose]);

  if (!isVisible) {
    // Don't show if not visible or if player doesn't have a call option (if that info is passed)
    return null;
  }

  const defaultMessage =
    "If you want to use your Call Option, now is the time!";
  const displayMessage = message || defaultMessage;

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 w-full p-4 sm:p-6 bg-gray-800 bg-opacity-90 text-white shadow-2xl z-[900] transition-transform duration-500 ease-in-out ${
        isVisible ? "translate-y-0" : "translate-y-full pointer-events-none"
      }`}
      role="alert"
      aria-live="assertive"
    >
      <div className="container mx-auto flex flex-col items-center text-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-10 h-10 sm:w-12 sm:h-12 mb-2 text-blue-400"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 0-11.25a6.01 6.01 0 0 0 0 11.25Zm0 0H12m0 0H12m0 0H12m0 0H12m0-5.25a3 3 0 0 0-3 3v2.25M12 12.75a3 3 0 0 1 3 3v2.25M12 12.75a3 3 0 0 0 3-3V7.5M12 12.75a3 3 0 0 1-3-3V7.5M12 18v-5.25"
          />{" "}
          {/* A more abstract "option" or "choice" icon */}
        </svg>
        <p className="text-xl sm:text-2xl md:text-3xl font-semibold mb-3">
          {displayMessage}
        </p>
        {/* Progress Bar */}
        <div className="w-full max-w-md h-1.5 sm:h-2 bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500"
            style={{ width: `${progress}%`, transition: "width 0.1s linear" }}
          ></div>
        </div>
      </div>
    </div>
  );
};
