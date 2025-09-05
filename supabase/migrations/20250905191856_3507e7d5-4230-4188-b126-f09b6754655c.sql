-- Criação das tabelas para o sistema Dona Oferta

-- Tabela de supermercados
CREATE TABLE public.supermercados (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  regiao TEXT NOT NULL,
  cep_faixa_inicial INT NOT NULL,
  cep_faixa_final INT NOT NULL,
  url_ofertas TEXT,
  tipo_extracao TEXT NOT NULL CHECK (tipo_extracao IN ('site', 'pdf')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de ofertas
CREATE TABLE public.ofertas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  supermercado_id UUID NOT NULL REFERENCES public.supermercados(id) ON DELETE CASCADE,
  nome_produto TEXT NOT NULL,
  preco NUMERIC(10,2) NOT NULL,
  data_inicio_validade DATE NOT NULL,
  data_fim_validade DATE NOT NULL,
  data_extracao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de usuários (sem autenticação tradicional)
CREATE TABLE public.usuarios (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  telefone_whatsapp TEXT NOT NULL UNIQUE,
  cep INT NOT NULL,
  cpf TEXT NOT NULL,
  plano TEXT NOT NULL DEFAULT 'trial' CHECK (plano IN ('trial', 'basico', 'premium')),
  data_fim_trial TIMESTAMP WITH TIME ZONE DEFAULT (now() + interval '60 days'),
  formato_oferta_preferido TEXT DEFAULT 'Texto' CHECK (formato_oferta_preferido IN ('PDF', 'Texto')),
  supermercados_preferidos UUID[] DEFAULT '{}',
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de encartes PDF armazenados
CREATE TABLE public.encartes_pdf_armazenados (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  supermercado_id UUID NOT NULL REFERENCES public.supermercados(id) ON DELETE CASCADE,
  data_encarte DATE NOT NULL,
  url_storage TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Índices para otimização
CREATE INDEX idx_ofertas_supermercado_validade ON public.ofertas(supermercado_id, data_fim_validade);
CREATE INDEX idx_usuarios_telefone ON public.usuarios(telefone_whatsapp);
CREATE INDEX idx_usuarios_cep ON public.usuarios(cep);
CREATE INDEX idx_supermercados_cep_range ON public.supermercados(cep_faixa_inicial, cep_faixa_final);

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Triggers para atualizar timestamps
CREATE TRIGGER update_supermercados_updated_at
  BEFORE UPDATE ON public.supermercados
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_usuarios_updated_at
  BEFORE UPDATE ON public.usuarios
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Como não haverá autenticação tradicional, as tabelas serão públicas
-- mas com controle via Edge Functions
ALTER TABLE public.supermercados ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ofertas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.encartes_pdf_armazenados ENABLE ROW LEVEL SECURITY;

-- Políticas públicas para acesso via Edge Functions
CREATE POLICY "Allow public access to supermercados" ON public.supermercados FOR ALL USING (true);
CREATE POLICY "Allow public access to ofertas" ON public.ofertas FOR ALL USING (true);
CREATE POLICY "Allow public access to usuarios" ON public.usuarios FOR ALL USING (true);
CREATE POLICY "Allow public access to encartes" ON public.encartes_pdf_armazenados FOR ALL USING (true);