-- Criar buckets de storage para encartes PDF
INSERT INTO storage.buckets (id, name, public) VALUES ('encartes-pdf', 'encartes-pdf', true);

-- Política de storage para permitir uploads de PDFs
CREATE POLICY "Allow public uploads to encartes-pdf" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'encartes-pdf');

CREATE POLICY "Allow public access to encartes-pdf" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'encartes-pdf');