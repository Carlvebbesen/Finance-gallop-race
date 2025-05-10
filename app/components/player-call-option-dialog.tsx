export interface CallOptionConfirmationProps {
  isVisible: boolean;
  assetName: string;
  onConfirm: () => void; // Callback for "Yes"
  onDecline: () => void; // Callback for "No"
  playerName?: string; // Optional: to personalize the message
}

// --- CallOptionConfirmation Component ---
export const CallOptionConfirmation: React.FC<CallOptionConfirmationProps> = ({
  isVisible,
  assetName,
  onConfirm,
  onDecline,
  playerName,
}) => {
  if (!isVisible) {
    return null;
  }

  const message = `${
    playerName ? playerName + ", do" : "Do"
  } you want to use your Call Option on ${assetName}?`;

  return (
    <div
      className={`fixed inset-x-0 bottom-0 w-full p-4 bg-gray-800 text-white shadow-2xl z-[950] transition-transform duration-300 ease-in-out ${
        isVisible ? "translate-y-0" : "translate-y-full"
      }`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="call-option-confirmation-title"
    >
      <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between text-center sm:text-left">
        <div className="mb-4 sm:mb-0 sm:mr-6">
          <h2
            id="call-option-confirmation-title"
            className="text-lg sm:text-xl md:text-2xl font-semibold"
          >
            Call Option Opportunity!
          </h2>
          <p className="text-sm sm:text-base text-gray-300">{message}</p>
        </div>
        <div className="flex space-x-3 sm:space-x-4 w-full sm:w-auto">
          <button
            onClick={onConfirm}
            className="flex-1 sm:flex-none px-6 py-3 bg-green-500 hover:bg-green-600 text-white text-base sm:text-lg font-semibold rounded-lg shadow-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-75"
          >
            Yes
          </button>
          <button
            onClick={onDecline}
            className="flex-1 sm:flex-none px-6 py-3 bg-red-500 hover:bg-red-600 text-white text-base sm:text-lg font-semibold rounded-lg shadow-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-75"
          >
            No
          </button>
        </div>
      </div>
    </div>
  );
};
