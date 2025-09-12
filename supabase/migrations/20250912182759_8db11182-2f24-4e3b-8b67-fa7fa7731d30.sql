-- Criar tabela para mensagens de contato do site institucional
CREATE TABLE public.contato_mensagens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  telefone TEXT,
  empresa TEXT,
  mensagem TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'nova',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.contato_mensagens ENABLE ROW LEVEL SECURITY;

-- Create policy for inserting messages (anyone can send)
CREATE POLICY "Anyone can insert contact messages" 
ON public.contato_mensagens 
FOR INSERT 
WITH CHECK (true);

-- Create policy for viewing messages (admin only - will need auth later)
CREATE POLICY "Admin can view contact messages" 
ON public.contato_mensagens 
FOR SELECT 
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_contato_mensagens_updated_at
BEFORE UPDATE ON public.contato_mensagens
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();