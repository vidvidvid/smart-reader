// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async (req) => {
    // /api/nonce

    const { address } = await req.json();
    const nonce = Math.floor(Math.random() * 1000000);

    await database
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
