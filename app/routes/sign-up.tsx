import { createClient } from "~/lib/supabase/client";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { useNavigate } from "react-router";
import { GameInfoCard } from "~/components/game-info";
import { useRef, useState } from "react";
import { saveNickname } from "~/lib/utils";
import SpectateGameCard from "~/components/view/spectateGameCard";

export default function SignUp() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const nickname = useRef("");
  const navigate = useNavigate();

  const signup = async () => {
    setError(() => "");
    setLoading(() => true);
    if (nickname.current.length < 1) {
      setError(() => "Nickname is required");
      setLoading(() => false);
      return;
    }
    const supabase = createClient();
    const { error } = await supabase.auth.signInAnonymously();
    if (error) {
      setError(error.message);
      setLoading(() => false);
      return;
    }
    saveNickname(nickname.current);
    setLoading(() => false);
    navigate("/");
  };
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 gap-8 md:flex-row flex-col">
      <div>
        <div className="w-full max-w-sm">
          <div className="flex flex-col gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">SignUp Here!</CardTitle>
                <CardDescription>
                  Create a nickname for yourself!
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-6">
                  {error && (
                    <p className="text-sm text-destructive-500">{error}</p>
                  )}
                  <input
                    type="text"
                    onChange={(e) => (nickname.current = e.target.value)}
                    name="nickname"
                    placeholder="Nickname"
                    className={`w-full rounded-md border border-input bg-background px-3 py-2 ${
                      error.length > 0 ? "border-red-500 border-2" : ""
                    }`}
                  />
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={loading}
                    onClick={signup}
                  >
                    {loading ? "Creating profile..." : "Sign in anonymously"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          <SpectateGameCard />
        </div>
      </div>
      <GameInfoCard />
    </div>
  );
}
