import { createClient } from "~/lib/supabase/server";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { type ActionFunctionArgs, useFetcher, useNavigate } from "react-router";
import { GameInfoCard } from "~/components/game-info";
import { useState } from "react";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { supabase } = createClient(request);
  const origin = new URL(request.url).origin;
  const formData = await request.formData();

  console.log("origin", origin);
  console.log(formData);
  const email = formData.get("email") as string;
  if (email.length === 0) {
    return {
      error: "Email and nickname are required",
    };
  }
  const { error } = await supabase.auth.signInWithOtp({
    email: email,
    options: {
      shouldCreateUser: true,
    },
  });
  if (error) {
    return {
      error: error instanceof Error ? error.message : "An error occurred",
    };
  }
  return {
    status: "success",
  };
};

export default function SignUp() {
  const fetcher = useFetcher<typeof action>();

  const error = fetcher.data?.error;
  const success = fetcher.data?.status === "success";
  const loading = fetcher.state === "submitting";

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 gap-8 md:flex-row flex-col">
      <div>
        <div className="w-full max-w-sm">
          <div className="flex flex-col gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Welcome!</CardTitle>
                <CardDescription>
                  Sign in or Create an account to continue
                </CardDescription>
              </CardHeader>
              <CardContent>
                {success ? (
                  <p className="text-sm text-green-500">
                    Successfully sent magic link
                  </p>
                ) : (
                  <fetcher.Form method="post">
                    <div className="flex flex-col gap-6">
                      {error && (
                        <p className="text-sm text-destructive-500">{error}</p>
                      )}
                      <input
                        type="email"
                        name="email"
                        placeholder="Email for the magic link"
                        className="w-full rounded-md border border-input bg-background px-3 py-2"
                      />
                      <Button
                        type="submit"
                        className="w-full"
                        disabled={loading}
                      >
                        {loading ? "Logging in..." : "Continue with magic link"}
                      </Button>
                    </div>
                  </fetcher.Form>
                )}
              </CardContent>
            </Card>
          </div>
          <ViewGameCard />
        </div>
      </div>
      <GameInfoCard />
    </div>
  );
}

function ViewGameCard() {
  const [gameId, setGameId] = useState("");
  const navigate = useNavigate();
  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="text-xl">View a Game</CardTitle>
        <CardDescription>
          Enter a game ID to watch as a spectator
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Enter Game ID"
            className="w-full rounded-md border border-input bg-background px-3 py-2"
            onChange={(e) => setGameId(e.target.value)}
          />
          <Button
            onClick={() => {
              if (gameId) {
                navigate(`/game/${gameId}/spectate`);
              }
            }}
            disabled={gameId.length < 5}
          >
            Watch Game
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
