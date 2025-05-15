import type { Route } from "./+types/home";
import { Card, CardContent, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { redirect } from "react-router";
import { BackgroundBeamsWithCollision } from "~/components/backgrounds/background-collision";
import { GameInfoCard } from "~/components/game-info";
import { Link } from "react-router";
import { createClient } from "~/lib/supabase/client";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Finance Gallop Royale" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}
export const clientLoader = async () => {
  const supabase = createClient();

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    return redirect("/signup");
  }
};

export default function Home() {
  return (
    <BackgroundBeamsWithCollision className="flex flex-col h-full">
      <div className="p-10 text-center flex justify-between w-full">
        <h1 className="text-5xl">Horse Betting Finance Edition!</h1>
      </div>
      <div className="flex md:flex-row flex-col justify-around w-full">
        <div className="flex flex-col">
          <Card className="min-w-76 flex justify-center items-center p-12">
            <CardTitle>Create a new Stock Exchange Market</CardTitle>
            <CardContent>
              <Button>
                <Link to={"create/game"}>Create</Link>
              </Button>
            </CardContent>
          </Card>
          <Card className="min-w-76 flex justify-center items-center p-12">
            <CardTitle>Join a Stock Exchange Market</CardTitle>
            <CardContent>
              <Button>
                <Link to={"join/game"}>Join</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
        <GameInfoCard />
      </div>
    </BackgroundBeamsWithCollision>
  );
}
