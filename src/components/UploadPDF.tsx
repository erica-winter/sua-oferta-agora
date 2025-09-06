import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Upload, FileText, Download, Trash2, Eye, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface EncartePDF {
  id: string;
  supermercado_id: string;
  data_encarte: string;
  url_storage: string;
  created_at: string;
  supermercado?: {
    nome: string;
  };
}

interface UploadPDFProps {
  supermercados: Array<{
    id: string;
    nome: string;
  }>;
  onUploadSuccess?: () => void;
}

export const UploadPDF = ({ supermercados, onUploadSuccess }: UploadPDFProps) => {
  const { toast } = useToast();
  const [encartes, setEncartes] = useState<EncartePDF[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedSupermercado, setSelectedSupermercado] = useState<string>("");
  const [dataEncarte, setDataEncarte] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadEncartes = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('encartes_pdf_armazenados')
        .select(`
          *,
          supermercado:supermercados(nome)
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setEncartes(data || []);
    } catch (error) {
      console.error('Erro ao carregar encartes:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar encartes",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const uploadPDF = async (file: File) => {
    if (!selectedSupermercado || !dataEncarte) {
      toast({
        title: "Erro",
        description: "Selecione o supermercado e a data do encarte",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    try {
      // Gerar nome único para o arquivo
      const fileExt = file.name.split('.').pop();
      const fileName = `${selectedSupermercado}/${dataEncarte}/${Date.now()}.${fileExt}`;

      // Upload do arquivo para o storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('encartes-pdf')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Obter URL pública do arquivo
      const { data: { publicUrl } } = supabase.storage
        .from('encartes-pdf')
        .getPublicUrl(fileName);

      // Salvar registro no banco
      const { error: insertError } = await supabase
        .from('encartes_pdf_armazenados')
        .insert([{
          supermercado_id: selectedSupermercado,
          data_encarte: dataEncarte,
          url_storage: publicUrl
        }]);

      if (insertError) throw insertError;

      toast({
        title: "Sucesso",
        description: "Encarte PDF enviado com sucesso!"
      });

      // Limpar formulário
      setSelectedSupermercado("");
      setDataEncarte("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      // Recarregar lista e notificar componente pai
      loadEncartes();
      onUploadSuccess?.();

    } catch (error) {
      console.error('Erro no upload:', error);
      toast({
        title: "Erro",
        description: "Erro ao enviar PDF",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        toast({
          title: "Erro",
          description: "Apenas arquivos PDF são permitidos",
          variant: "destructive"
        });
        return;
      }
      
      if (file.size > 10 * 1024 * 1024) { // 10MB
        toast({
          title: "Erro", 
          description: "Arquivo muito grande. Máximo 10MB",
          variant: "destructive"
        });
        return;
      }

      uploadPDF(file);
    }
  };

  const removerEncarte = async (id: string, url: string) => {
    try {
      // Extrair o path do arquivo da URL
      const urlParts = url.split('/');
      const filePath = urlParts.slice(-3).join('/'); // supermercado/data/arquivo.pdf

      // Remover arquivo do storage
      const { error: deleteStorageError } = await supabase.storage
        .from('encartes-pdf')
        .remove([filePath]);

      if (deleteStorageError) {
        console.error('Erro ao remover do storage:', deleteStorageError);
      }

      // Remover registro do banco
      const { error: deleteError } = await supabase
        .from('encartes_pdf_armazenados')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      toast({
        title: "Sucesso",
        description: "Encarte removido com sucesso!"
      });

      loadEncartes();
    } catch (error) {
      console.error('Erro ao remover encarte:', error);
      toast({
        title: "Erro",
        description: "Erro ao remover encarte",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload de Encartes PDF
          </CardTitle>
          <CardDescription>
            Envie encartes em PDF dos supermercados para processamento automático
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="supermercado">Supermercado</Label>
              <Select value={selectedSupermercado} onValueChange={setSelectedSupermercado}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o supermercado" />
                </SelectTrigger>
                <SelectContent>
                  {supermercados.map((supermercado) => (
                    <SelectItem key={supermercado.id} value={supermercado.id}>
                      {supermercado.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="data_encarte">Data do Encarte</Label>
              <Input
                id="data_encarte"
                type="date"
                value={dataEncarte}
                onChange={(e) => setDataEncarte(e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="pdf_file">Arquivo PDF</Label>
            <Input
              id="pdf_file"
              type="file"
              accept=".pdf"
              ref={fileInputRef}
              onChange={handleFileSelect}
              disabled={uploading}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Máximo 10MB. Apenas arquivos PDF.
            </p>
          </div>

          {uploading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Enviando PDF...
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Encartes Armazenados</CardTitle>
            <CardDescription>
              PDFs enviados recentemente
            </CardDescription>
          </div>
          <Button onClick={loadEncartes} variant="outline" size="sm">
            <Eye className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px]">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : encartes.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Nenhum encarte encontrado
              </p>
            ) : (
              <div className="space-y-3">
                {encartes.map((encarte) => (
                  <div key={encarte.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-red-500" />
                      <div>
                        <h4 className="font-medium">{encarte.supermercado?.nome}</h4>
                        <p className="text-sm text-muted-foreground">
                          {new Date(encarte.data_encarte).toLocaleDateString('pt-BR')}
                        </p>
                        <Badge variant="outline" className="text-xs">
                          {new Date(encarte.created_at).toLocaleDateString('pt-BR')}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(encarte.url_storage, '_blank')}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => removerEncarte(encarte.id, encarte.url_storage)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};