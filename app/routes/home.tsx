import type { Route } from "./+types/home";
import { Card, CardContent, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { createClient } from "~/lib/supabase/server";
import { type LoaderFunctionArgs, redirect, useLoaderData } from "react-router";
import { BackgroundBeamsWithCollision } from "~/components/backgrounds/background-collision";
import { GameInfoCard } from "~/components/game-info";
import { Link } from "react-router";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Finance Gallop Royale" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { supabase } = createClient(request);

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    return redirect("/signup");
  }

  const { data: player, error: playerError } = await supabase
    .from("player")
    .select()
    .eq("id", data.user.id)
    .single();
  if (!player) {
    return redirect("/create/player");
  }
  return player;
};

export default function Home() {
  const { nickname } = useLoaderData<typeof loader>();
  return (
    <BackgroundBeamsWithCollision className="flex flex-col">
      <div className="p-10 text-center flex justify-between w-full">
        <h1 className="text-5xl">Horse Betting Finance Edition!</h1>
        <div className="flex items-baseline gap-4">
          <span className="text-lg font-bold">Welcome {nickname}</span>
          <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-gray-200"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>
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
