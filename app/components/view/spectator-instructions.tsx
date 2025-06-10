import { Badge } from "../ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

export function SpectatorInstructions({ gameId }: { gameId: string }) {
  return (
    <Card className="max-w-3xl mx-auto p-4">
      <CardHeader>
        <CardTitle className="text-2xl text-center">
          🏇 Welcome to Hesteveddeløp!
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 text-base leading-relaxed">
        <div className="text-center">
          <p>
            Join the game using code:{" "}
            <span className="font-bold text-lg bg-muted px-2 py-1 rounded">
              {gameId}
            </span>
          </p>
          <p>Open your phone, enter the code, and you're in!</p>
        </div>

        <div>
          <h3 className="font-semibold">📊 Place Your Bets</h3>
          <p>
            Choose the asset you believe will reach the highest gain after 12
            rounds. You can:
          </p>
          <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
            <li>
              <strong>Invest:</strong> Bet <em>on</em> an asset to win.
            </li>
            <li>
              <strong>Short:</strong> Bet <em>against</em> an asset finishing
              last.
            </li>
          </ul>
          <p className="mt-2">
            <strong>Important:</strong> You must drink the number of sips you
            bet immediately!
          </p>
        </div>

        <div>
          <h3 className="font-semibold">💼 Asset Behavior</h3>
          <p>
            Each asset has its own typical behavior — some are volatile, others
            stable. While direction is random (up or down), the <em>amount</em>{" "}
            of change is influenced by its real-world characteristics.
          </p>
          <div className="flex flex-wrap gap-2 mt-3">
            <Badge variant="secondary">📈 Stocks – Balanced</Badge>
            <Badge variant="secondary">🪙 Crypto – High Risk/Reward</Badge>
            <Badge variant="secondary">🥇 Gold – Steady</Badge>
            <Badge variant="secondary">💼 Bonds – Slow & Safe</Badge>
          </div>
        </div>

        <div>
          <h3 className="font-semibold">⚙️ Game Flow</h3>
          <ul className="list-decimal list-inside space-y-2 mt-2">
            <li>All players place their bets and drink accordingly.</li>
            <li>
              The game begins and runs through <strong>12 rounds</strong>.
            </li>
            <li>
              Around halfway, <strong>Put</strong> and{" "}
              <strong>Call Options</strong> become available:
              <ul className="list-disc list-inside ml-6 mt-1">
                <li>Call: Add a backup asset (7 sips)</li>
                <li>Put: Sabotage another player's pick (7 sips)</li>
              </ul>
            </li>
            <li>The asset with the highest percentage gain at the end wins!</li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold">🍻 Rewards & Penalties</h3>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li>
              <strong>Correct Invest:</strong> Hand out <strong>2×</strong> the
              sips you bet.
            </li>
            <li>
              <strong>Correct Short:</strong> Hand out <strong>3×</strong> the
              sips you bet!
            </li>
            <li>
              <strong>Wrong Short:</strong> If your shorted asset wins,{" "}
              <em>you drink again!</em>
            </li>
          </ul>
        </div>

        <div className="italic text-center">
          Ready up, place your bets, and let the race begin!
          <br />
          May your asset rise — and your glass stay full 🍻📉📈
        </div>
      </CardContent>
    </Card>
  );
}
