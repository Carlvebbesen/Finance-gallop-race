import { Copy } from "lucide-react";
import { useState } from "react";

export function GameIdCard({ game }: { game: { game_id: string } }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(game.game_id);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500); // Reset after 1.5s
  };

  return (
    <div className="flex bg-gray-200 rounded-4xl p-4 justify-around items-center space-x-4 max-w-84 m-4">
      <h3 className="text-xl font-bold">GameId: {game.game_id}</h3>
      <button
        onClick={handleCopy}
        className="text-sm bg-white px-3 py-1 rounded-lg shadow hover:bg-gray-100 transition flex gap-2"
      >
        {copied ? "Copied!" : "Copy "} <Copy />
      </button>
    </div>
  );
}
