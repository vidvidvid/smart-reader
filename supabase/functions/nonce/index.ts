// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Database } from "../../lib/database.types.ts";

const SUPABASE_TABLE_USER = "users";
serve(async (req) => {
    // /api/nonce
    const { method, headers: reqHeaders } = req;
    const origin = reqHeaders.get("Origin") || "";

    // List of trusted origins
    const allowedOrigins = [
        "http://localhost:3000", // TODO delete this once deployed
        "https://localhost:3000", // TODO delete this once deployed
        // "https://your-production-site.com",  // TODO add the actual url of the production site
    ];

    const headers = new Headers();
    if (allowedOrigins.includes(origin)) {
        headers.set("Access-Control-Allow-Origin", origin);
    }
    headers.set(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, PATCH, DELETE, OPTIONS"
    );
    headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    headers.set("Access-Control-Allow-Credentials", "true");

    if (method === "OPTIONS") {
        // Respond to CORS preflight requests
        return new Response(null, { headers });
    }

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
    headers.append("Content-Type", "application/json");

    console.log(reponse);
    const data = { nonce: nonce };
    return new Response(JSON.stringify(data), {
        headers: headers,
    });
});
