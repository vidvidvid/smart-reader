// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Database } from "../../lib/database.types.ts";

const SUPABASE_TABLE_USER = "users";
serve(async (req) => {
    // /api/nonce

    const { address } = await req.json();
    const nonce = Math.floor(Math.random() * 1000000);
    const supabase = createClient<Database>(
        Deno.env.get("SUPABASE_URL") as string,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string // service role key required for row creation/editing
    );
    // create or update with an nonce and lastAuthStatus = pending so that they can sign the message in the browser
    const reponse = await supabase.from(SUPABASE_TABLE_USER).upsert(
        [
            {
                address: address,
                auth: {
                    genNonce: nonce,
                    lastAuth: new Date().toISOString(),
                    lastAuthStatus: "pending",
                },
            },
        ],
        {
            onConflict: "address",
        }
    );
    console.log(reponse);
    const data = { nonce: nonce };
    return new Response(JSON.stringify(data), {
        headers: { "Content-Type": "application/json" },
    });
});
