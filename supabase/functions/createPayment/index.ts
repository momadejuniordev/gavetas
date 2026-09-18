import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const PAYSUITE_URL = "https://paysuite.tech/api/v1/payments";
const PAYSUITE_KEY = Deno.env.get("PAYSUITE_KEY");

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};

serve(async (req) => {
  // CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers });
  }

  // Apenas POST
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({
        error: "POST only",
      }),
      {
        status: 405,
        headers,
      }
    );
  }

  try {
    // Verificar chave PaySuite
    if (!PAYSUITE_KEY) {
      console.error("PAYSUITE_KEY não configurada");

      return new Response(
        JSON.stringify({
          error: "PAYSUITE_KEY missing",
        }),
        {
          status: 500,
          headers,
        }
      );
    }

    // Ler dados enviados pelo frontend
    const body = await req.json();

    console.log("Pedido recebido:", {
      amount: body.amount,
      reference: body.reference,
      customer: body.customer,
    });

    // Validar campos obrigatórios
    if (!body.amount || !body.reference) {
      return new Response(
        JSON.stringify({
          error: "amount and reference are required",
        }),
        {
          status: 400,
          headers,
        }
      );
    }

    // Validar customer
    if (
      !body.customer ||
      !body.customer.name ||
      !body.customer.email ||
      !body.customer.phone
    ) {
      return new Response(
        JSON.stringify({
          error: "customer name, email and phone are required",
        }),
        {
          status: 400,
          headers,
        }
      );
    }

    // Preparar pedido para o PaySuite
    const paymentData = {
      amount: String(body.amount),
      reference: String(body.reference),

      ...(body.description && {
        description: String(body.description),
      }),

      ...(body.return_url && {
        return_url: String(body.return_url),
      }),

      customer: {
        name: String(body.customer.name),
        email: String(body.customer.email),
        phone: String(body.customer.phone),
      },
    };

    console.log("Enviando para PaySuite:", paymentData);

    // Criar pagamento no PaySuite
    const response = await fetch(PAYSUITE_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PAYSUITE_KEY}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(paymentData),
    });

    // Ler resposta
    const responseText = await response.text();

    let data;

    try {
      data = JSON.parse(responseText);
    } catch {
      data = {
        message: responseText,
      };
    }

    console.log("Resposta PaySuite:", {
      status: response.status,
      data,
    });

    // Retornar exatamente a resposta do PaySuite
    return new Response(
      JSON.stringify(data),
      {
        status: response.status,
        headers,
      }
    );

  } catch (error) {
    console.error("Erro na Edge Function:", error);

    return new Response(
      JSON.stringify({
        error:
          error instanceof Error
            ? error.message
            : "Internal server error",
      }),
      {
        status: 500,
        headers,
      }
    );
  }
});