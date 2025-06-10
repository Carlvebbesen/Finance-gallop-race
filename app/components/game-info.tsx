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
        <p>
          {" "}
          <strong>Here's how the fun begins:</strong>{" "}
        </p>{" "}
        <ol className="list-decimal list-inside space-y-2 mt-2">
          {" "}
          <li>
            {" "}
            <strong>Set Up the Game:</strong> One player creates a game lobby,
            and the others join in.{" "}
          </li>{" "}
          <li>
            {" "}
            <strong>Cast to a Bigger Screen:</strong> Once everyone’s in, set
            the game to <em>Spectator Mode</em> and cast it to a TV or a large
            screen. That way, everyone can enjoy the drama unfold!{" "}
          </li>{" "}
          <li>
            {" "}
            <strong>Place Your Bets:</strong> Each player chooses which asset(s)
            they believe will hit <strong>100% market gain</strong> first.{" "}
            <br /> Players bet with sips — more risk, more to drink!{" "}
          </li>{" "}
          <li>
            {" "}
            <strong>The Race Begins:</strong> The market simulation starts. Each
            round, assets grow by random percentages, and players watch the
            market battle unfold in real time.{" "}
          </li>{" "}
          <li>
            {" "}
            <strong>Game End:</strong> Once an asset reaches 100%, the game
            declares a winner. <br /> Depending on how your bet went, it’s time
            to drink — or make others drink!{" "}
          </li>{" "}
          <li>
            {" "}
            <strong>Play Again?</strong> After the dust settles (and drinks are
            shared), you can easily restart the game for another round of
            mayhem.{" "}
          </li>{" "}
        </ol>{" "}
        <p className="italic mt-4">
          {" "}
          Set your sights, place your bets, and let the bubbles and markets rise
          together! 🍾📈{" "}
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
