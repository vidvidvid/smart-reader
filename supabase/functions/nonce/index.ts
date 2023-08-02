// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Database } from "../../lib/database.types.ts";
// import { Database } from "lib/database.types";

const SUPABASE_TABLE_USER = "users";
serve(async (req) => {
    // /api/nonce

    const { address } = await req.json();
    const nonce = Math.floor(Math.random() * 1000000);
    const supabase = createClient<Database>(
        Deno.env.get(`SUPABASE_URL`) as string,
        Deno.env.get(`SUPABASE_ANON_KEY`) as string
    );

    await supabase
        .from(SUPABASE_TABLE_USER)
        .update({
            auth: {
                genNonce: nonce,
                lastAuth: new Date().toISOString(),
                lastAuthStatus: "pending",
            },
        })
        .eq("address", address);

    return new Response(JSON.stringify(nonce), {
        headers: { "Content-Type": "application/json" },
    });
});
