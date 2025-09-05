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

    const { supermercado_id, ofertas_extraidas, url_pdf } = await req.json();

    // Buscar dados do supermercado
    const { data: supermercado, error: supermercadoError } = await supabaseClient
      .from('supermercados')
      .select('*')
      .eq('id', supermercado_id)
      .single();

    if (supermercadoError || !supermercado) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Supermercado não encontrado' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processando ofertas para ${supermercado.nome}`);

    // Remover ofertas antigas do mesmo supermercado (mais de 7 dias)
    const setesDiasAtras = new Date();
    setesDiasAtras.setDate(setesDiasAtras.getDate() - 7);

    const { error: deleteError } = await supabaseClient
      .from('ofertas')
      .delete()
      .eq('supermercado_id', supermercado_id)
      .lt('created_at', setesDiasAtras.toISOString());

    if (deleteError) {
      console.error('Erro ao limpar ofertas antigas:', deleteError);
    }

    // Inserir novas ofertas
    const ofertasParaInserir = ofertas_extraidas.map((oferta: any) => ({
      supermercado_id: supermercado_id,
      nome_produto: oferta.nome_produto,
      preco: parseFloat(oferta.preco),
      data_inicio_validade: oferta.data_inicio_validade || new Date().toISOString().split('T')[0],
      data_fim_validade: oferta.data_fim_validade,
      data_extracao: new Date().toISOString()
    }));

    const { data: ofertasInseridas, error: insertError } = await supabaseClient
      .from('ofertas')
      .insert(ofertasParaInserir)
      .select();

    if (insertError) {
      console.error('Erro ao inserir ofertas:', insertError);
      throw insertError;
    }

    console.log(`${ofertasInseridas?.length || 0} ofertas inseridas para ${supermercado.nome}`);

    // Se houver URL do PDF, salvar no storage e registrar
    if (url_pdf && supermercado.tipo_extracao === 'pdf') {
      try {
        const dataEncarte = new Date().toISOString().split('T')[0];
        
        const { data: encarteExistente } = await supabaseClient
          .from('encartes_pdf_armazenados')
          .select('id')
          .eq('supermercado_id', supermercado_id)
          .eq('data_encarte', dataEncarte)
          .single();

        if (!encarteExistente) {
          const { error: encarteError } = await supabaseClient
            .from('encartes_pdf_armazenados')
            .insert([{
              supermercado_id: supermercado_id,
              data_encarte: dataEncarte,
              url_storage: url_pdf
            }]);

          if (encarteError) {
            console.error('Erro ao salvar encarte PDF:', encarteError);
          } else {
            console.log('Encarte PDF registrado com sucesso');
          }
        }
      } catch (encarteError) {
        console.error('Erro ao processar encarte PDF:', encarteError);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `${ofertasInseridas?.length || 0} ofertas processadas para ${supermercado.nome}`,
        ofertas_inseridas: ofertasInseridas?.length || 0,
        supermercado: supermercado.nome
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erro na função processar-ofertas:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});