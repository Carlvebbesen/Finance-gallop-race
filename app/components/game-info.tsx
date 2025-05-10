import { Badge } from "./ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

export function GameInfoCard() {
  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle className="text-xl">
          🏁 Game Info: "Veddeløpet"-Inspired Investment Game
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm leading-relaxed">
        <p>
          <strong>
            Welcome to the ultimate mix of strategy, chance, and sips!
          </strong>
          <br />
          Inspired by the Norwegian game <em>Veddeløpet</em>, this game combines
          investing, gambling, and drinking into a race to the top.
        </p>

        <div>
          <h3 className="font-semibold">🎯 Objective</h3>
          <p>
            Be the first player whose chosen asset reaches{" "}
            <strong>100% market gain</strong>.
          </p>
        </div>

        <div>
          <h3 className="font-semibold">💸 Assets to Bet On</h3>
          <div className="flex flex-wrap gap-2 mt-2">
            <Badge variant="secondary">📈 Stocks</Badge>
            <Badge variant="secondary">🪙 Crypto</Badge>
            <Badge variant="secondary">🥇 Gold</Badge>
            <Badge variant="secondary">💼 Bonds</Badge>
          </div>
          <p className="mt-2">
            Each round, assets increase by a random percentage gain — the race
            is on!
          </p>
        </div>

        <div>
          <h3 className="font-semibold">🧠 How to Play</h3>
          <ul className="list-disc list-inside space-y-2 mt-2">
            <li>
              <strong>Invest (Standard Bet):</strong> Bet <em>on</em> an asset
              to win.
              <br />
              <em>If it wins, others drink. If it loses, you drink.</em>
            </li>
            <li>
              <strong>Short an Asset:</strong> Bet <em>against</em> an asset.
              <br />
              <em>
                If that asset finishes last, others drink. But if the asset
                wins, you drink!
              </em>
            </li>
            <li>
              <strong>Put Option (7 sips):</strong> Drink 7 sips to:
              <ul className="list-disc list-inside ml-4">
                <li>Bet against another player's asset</li>
                <li>
                  You get the option to switch asset for another player halfway
                </li>
              </ul>
            </li>
            <li>
              <strong>Call Option (7 sips):</strong> Drink 7 sips to:
              <ul className="list-disc list-inside ml-4">
                <li>Pre-select a second asset</li>
                <li>Switch to it halfway through the game</li>
                <li>You keep the original sips count</li>
              </ul>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold">🔁 Game Flow</h3>
          <p>
            Each round simulates investment growth. First asset to hit{" "}
            <strong>100% gain</strong> wins!
          </p>
          <p>
            But don’t celebrate too soon — if the stock rises too quickly, you
            might quickly come under scrutiny and lose your returns!
          </p>
        </div>

        <p className="italic">
          Let the sips and the stocks flow 🍻📊
          <br />
          Make your bets, hedge your risks — and do not drink responsibly!
        </p>
      </CardContent>
    </Card>
  );
}
