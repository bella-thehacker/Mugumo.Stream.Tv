import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function jsonResponse(
  body: Record<string, unknown>,
  status = 200,
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed." }, 405);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");

  if (!supabaseUrl || !serviceRoleKey || !anonKey) {
    console.error("Required Supabase function environment variables are missing.");
    return jsonResponse({ error: "Authentication service is unavailable." }, 500);
  }

  let body: { username?: unknown; password?: unknown };

  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: "Invalid request body." }, 400);
  }

  const username =
    typeof body.username === "string"
      ? body.username.trim().toLowerCase()
      : "";

  const password =
    typeof body.password === "string" ? body.password : "";

  if (!/^[a-z0-9_]{3,30}$/.test(username) || !password) {
    return jsonResponse({ error: "Invalid username or password." }, 400);
  }

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const { data: profile, error: profileError } = await admin
    .from("account_profiles")
    .select("id")
    .eq("username", username)
    .maybeSingle();

  if (profileError) {
    console.error("Username lookup failed:", profileError.message);
    return jsonResponse({ error: "Authentication service is unavailable." }, 500);
  }

  if (!profile) {
    return jsonResponse({ error: "Invalid username or password." }, 401);
  }

  const { data: authData, error: userError } =
    await admin.auth.admin.getUserById(profile.id);

  const email = authData.user?.email;

  if (userError || !email) {
    console.error("Could not resolve the authentication account.");
    return jsonResponse({ error: "Invalid username or password." }, 401);
  }

  const authClient = createClient(supabaseUrl, anonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const { data, error } = await authClient.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.session) {
    return jsonResponse({ error: "Invalid username or password." }, 401);
  }

  return jsonResponse({
    session: data.session,
    user: data.user,
  });
});
