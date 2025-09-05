import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const { telefone_usuario } = await req.json();

    // Buscar dados do usuário
    const { data: usuario, error: usuarioError } = await supabaseClient
      .from('usuarios')
      .select('*')
      .eq('telefone_whatsapp', telefone_usuario)
      .eq('ativo', true)
      .single();

    if (usuarioError || !usuario) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Usuário não encontrado ou inativo' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verificar se o trial expirou (para usuários trial)
    if (usuario.plano === 'trial' && new Date() > new Date(usuario.data_fim_trial)) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Trial expirado - necessário assinar um plano',
          trial_expirado: true
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Buscar ofertas válidas dos supermercados preferidos do usuário
    const dataHoje = new Date().toISOString().split('T')[0];
    
    const { data: ofertas, error: ofertasError } = await supabaseClient
      .from('ofertas')
      .select(`
        *,
        supermercado:supermercados(nome, regiao)
      `)
      .in('supermercado_id', usuario.supermercados_preferidos)
      .gte('data_fim_validade', dataHoje)
      .order('created_at', { ascending: false })
      .limit(20);

    if (ofertasError) {
      console.error('Erro ao buscar ofertas:', ofertasError);
      throw ofertasError;
    }

    if (!ofertas || ofertas.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Nenhuma oferta disponível no momento' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Formatação para texto WhatsApp
    if (usuario.formato_oferta_preferido === 'Texto') {
      let mensagem = `🛒 *Ofertas Especiais para Você!*\n\n`;
      
      const ofertasPorSupermercado = ofertas.reduce((acc, oferta) => {
        const nomeSupermercado = oferta.supermercado?.nome || 'Supermercado';
        if (!acc[nomeSupermercado]) {
          acc[nomeSupermercado] = [];
        }
        acc[nomeSupermercado].push(oferta);
        return acc;
      }, {} as Record<string, any[]>);

      Object.entries(ofertasPorSupermercado).forEach(([supermercado, ofertasSuper]) => {
        mensagem += `🏪 *${supermercado}*\n`;
        ofertasSuper.slice(0, 5).forEach((oferta) => {
          const preco = parseFloat(oferta.preco).toFixed(2);
          const validade = new Date(oferta.data_fim_validade).toLocaleDateString('pt-BR');
          mensagem += `• ${oferta.nome_produto}\n`;
          mensagem += `  💰 \`R$ ${preco}\`\n`;
          mensagem += `  📅 Válido até ${validade}\n\n`;
        });
        mensagem += `\n`;
      });

      mensagem += `✨ _Dona Oferta - Economize sempre!_`;

      return new Response(
        JSON.stringify({ 
          success: true, 
          formato: 'texto',
          mensagem: mensagem,
          total_ofertas: ofertas.length
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Para formato PDF, buscar encarte mais recente
    if (usuario.formato_oferta_preferido === 'PDF') {
      const { data: encartes, error: encartesError } = await supabaseClient
        .from('encartes_pdf_armazenados')
        .select(`
          *,
          supermercado:supermercados(nome)
        `)
        .in('supermercado_id', usuario.supermercados_preferidos)
        .order('data_encarte', { ascending: false })
        .limit(3);

      if (encartesError) {
        console.error('Erro ao buscar encartes:', encartesError);
        throw encartesError;
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          formato: 'pdf',
          encartes: encartes || [],
          total_ofertas: ofertas.length
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: false, 
        message: 'Formato de oferta não suportado' 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erro na função ofertas-personalizadas:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});