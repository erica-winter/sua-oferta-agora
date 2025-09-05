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

    const { telefone, cep, cpf, formato_preferido } = await req.json();

    // Verificar se o usuário já existe
    const { data: usuarioExistente } = await supabaseClient
      .from('usuarios')
      .select('*')
      .eq('telefone_whatsapp', telefone)
      .single();

    if (usuarioExistente) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Usuário já cadastrado',
          usuario: usuarioExistente 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verificar supermercados disponíveis na região do CEP
    const cepNumerico = parseInt(cep.replace(/\D/g, ''));
    const { data: supermercados } = await supabaseClient
      .from('supermercados')
      .select('*')
      .lte('cep_faixa_inicial', cepNumerico)
      .gte('cep_faixa_final', cepNumerico);

    if (!supermercados || supermercados.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Região não coberta ainda',
          cep: cepNumerico
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Criar novo usuário
    const { data: novoUsuario, error } = await supabaseClient
      .from('usuarios')
      .insert([{
        telefone_whatsapp: telefone,
        cep: cepNumerico,
        cpf: cpf,
        formato_oferta_preferido: formato_preferido || 'Texto',
        supermercados_preferidos: supermercados.map(s => s.id)
      }])
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar usuário:', error);
      throw error;
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Usuário cadastrado com sucesso!',
        usuario: novoUsuario,
        supermercados_disponiveis: supermercados
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erro na função usuarios-whatsapp:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});