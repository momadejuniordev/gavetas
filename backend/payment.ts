import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const PAYSUITE_API_URL = "https://paysuite.tech/api/v1/payments";
const PAYSUITE_KEY = Deno.env.get("PAYSUITE_KEY");

if (!PAYSUITE_KEY) {
  console.error("PAYSUITE_KEY is not defined in environment variables");
  Deno.exit(1);
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};

serve(async (req) => {
  try {
    if (req.method === "OPTIONS") {
      return new Response("ok", { headers: corsHeaders });
    }

    const body = await req.json();
    const { amount, currency, customer } = body;

    if (!amount || !currency || !customer || !customer.name || !customer.email || !customer.phone) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const reference = `PAY${Date.now()}`;

    const payload = { amount, currency, reference, customer };

    const response = await fetch(PAYSUITE_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${PAYSUITE_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok || data.status !== "success") {
      return new Response(
        JSON.stringify({ success: false, error: data?.message || "Payment creation failed", raw: data }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, reference, checkout_url: data?.data?.checkout_url || null, raw: data }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
