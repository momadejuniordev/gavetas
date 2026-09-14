import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    console.log('Webhook recebido da PaySuite:', JSON.stringify(body));

    // A PaySuite envia o estado e a referência no body
    // Adaptar conforme a documentação real da PaySuite
    const reference = body?.reference || body?.data?.reference;
    const status = body?.status || body?.data?.status;

    if (!reference) {
      return new Response(
        JSON.stringify({ error: 'Referência em falta no webhook' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Usar Service Role Key para contornar Row Level Security
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Se o pagamento foi confirmado, atualizar o estado para 'paid'
    const isPaid =
      status === 'paid' ||
      status === 'completed' ||
      status === 'success' ||
      status === 'PAID';

    if (isPaid) {
      const { error: updateError } = await supabase
        .from('purchases')
        .update({ status: 'paid' })
        .eq('reference', reference);

      if (updateError) {
        console.error('Erro ao atualizar compra:', updateError);
        return new Response(
          JSON.stringify({ error: 'Erro ao atualizar base de dados' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log(Compra  marcada como paga.);
    } else {
      console.log(Estado recebido:  — nenhuma ação tomada.);
    }

    return new Response(
      JSON.stringify({ received: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (err) {
    console.error('Erro no webhook:', err.message);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
