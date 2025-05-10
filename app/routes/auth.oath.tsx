import { createClient } from "~/lib/supabase/server";
import { type LoaderFunctionArgs, redirect } from "react-router";
import type { EmailOtpType } from "@supabase/supabase-js";

export async function loader({ request }: LoaderFunctionArgs) {
  const { supabase, headers } = createClient(request);
  const requestUrl = new URL(request.url);
  const token_hash = requestUrl.searchParams.get("token_hash");
  const type = requestUrl.searchParams.get("type");
  const next = requestUrl.searchParams.get("next") || "/";
  const redirect_to = requestUrl.searchParams.get("redirect_to");
  if (token_hash) {
    const { error, data } = await supabase.auth.verifyOtp({
      type: (type as EmailOtpType) ?? "magiclink",
      token_hash: token_hash ?? "",
    });

    console.log("data", data);
    if (error) {
      console.error("Auth error:", error);
      return redirect(`/auth/error?error=${encodeURIComponent(error.message)}`);
    }
    const player = await supabase
      .from("player")
      .select("*")
      // @ts-ignore
      .eq("id", data?.user?.id);
    if (player.data?.length === 0) {
      return redirect(`create/player`);
    }
    return redirect(next, { headers });
  }
  return redirect(`/auth/error?error=No hash provided`);
}
