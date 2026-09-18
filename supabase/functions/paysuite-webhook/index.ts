import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-webhook-secret',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const WEBHOOK_SECRET = Deno.env.get('WEBHOOK_SECRET') || '';

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function validSecret(req: Request): boolean {
  if (!WEBHOOK_SECRET) {
    console.warn('WEBHOOK_SECRET não está definido: o webhook aceita qualquer pedido!');
    return true;
  }
  const provided = req.headers.get('x-webhook-secret') || req.headers.get('authorization')?.replace('Bearer ', '');
  return provided === WEBHOOK_SECRET;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  if (!validSecret(req)) {
    return json({ error: 'Invalid signature' }, 401);
  }

  try {
    const body = await req.json();
    console.log('Webhook recebido da PaySuite:', JSON.stringify(body));

    const reference = body?.reference || body?.data?.reference;
    const status = body?.status || body?.data?.status;

    if (!reference) {
      return json({ error: 'Referência em falta no webhook' }, 400);
    }

    // Usar Service Role Key para contornar Row Level Security
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Verificar que a compra existe antes de a alterar (impede falsificação de qualquer referência)
    const { data: purchase, error: fetchError } = await supabase
      .from('purchases')
      .select('status')
      .eq('reference', reference)
      .maybeSingle();

    if (fetchError) {
      console.error('Erro ao procurar compra:', fetchError);
      return json({ error: 'Erro a consultar a base de dados' }, 500);
    }

    if (!purchase) {
      return json({ error: 'Compra desconhecida' }, 404);
    }

    const isPaid =
      status === 'paid' ||
      status === 'completed' ||
      status === 'success' ||
      status === 'PAID';

    if (isPaid && purchase.status !== 'paid') {
      const { error: updateError } = await supabase
        .from('purchases')
        .update({ status: 'paid' })
        .eq('reference', reference);

      if (updateError) {
        console.error('Erro ao atualizar compra:', updateError);
        return json({ error: 'Erro ao atualizar base de dados' }, 500);
      }

      console.log('Compra marcada como paga:', reference);
    } else {
      console.log('Estado recebido:', status, '- nenhuma ação tomada');
    }

    return json({ received: true });
  } catch (err) {
    console.error('Erro no webhook:', err.message);
    return json({ error: err.message }, 500);
  }
});