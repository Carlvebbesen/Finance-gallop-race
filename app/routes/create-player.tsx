import { createClient } from "~/lib/supabase/server";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { type ActionFunctionArgs, redirect, useFetcher } from "react-router";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { supabase } = createClient(request);
  const formData = await request.formData();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return {
      error: "User not authenticated",
    };
  } 

  const nickname = formData.get("nickname") as string;
  if (nickname.length === 0) {
    return {
      error: "Nickname is required",
    };
  }

  const { error } = await supabase.from("player").insert({
    id: user.id,
    nickname: nickname,
  });
  console.log("error", error);
  if (error) {
    return {
      error: error instanceof Error ? error.message : "An error occurred",
    };
  }
  return redirect("/");
};

export default function CreatePlayer() {
  const fetcher = useFetcher<typeof action>();

  const error = fetcher.data?.error;
  const loading = fetcher.state === "submitting";

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 gap-8">
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Welcome!</CardTitle>
            <CardDescription>Create a nickname for yourself!</CardDescription>
          </CardHeader>
          <CardContent>
            <fetcher.Form method="post">
              <div className="flex flex-col gap-6">
                {error && (
                  <p className="text-sm text-destructive-500">{error}</p>
                )}
                <input
                  type="text"
                  name="nickname"
                  placeholder="Nickname"
                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                />
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Creating nickname..." : "Create nickname"}
                </Button>
              </div>
            </fetcher.Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
