import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw, CheckCircle, XCircle, Clock, Play } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface WebhookStatus {
  nome: string;
  endpoint: string;
  status: 'online' | 'offline' | 'error';
  ultimaExecucao: string;
  proximaExecucao: string;
  descricao: string;
}

export const WebhookMonitor = () => {
  const { toast } = useToast();
  const [webhooks, setWebhooks] = useState<WebhookStatus[]>([
    {
      nome: "Usuarios WhatsApp",
      endpoint: "usuarios-whatsapp",
      status: "online",
      ultimaExecucao: "Nunca executado",
      proximaExecucao: "Sob demanda",
      descricao: "Cadastro e gestão de usuários via WhatsApp"
    },
    {
      nome: "Ofertas Personalizadas",
      endpoint: "ofertas-personalizadas", 
      status: "online",
      ultimaExecucao: "Nunca executado",
      proximaExecucao: "Sob demanda",
      descricao: "Geração de ofertas customizadas por usuário"
    },
    {
      nome: "Processar Ofertas",
      endpoint: "processar-ofertas",
      status: "online", 
      ultimaExecucao: "Nunca executado",
      proximaExecucao: "Sob demanda",
      descricao: "Processamento e armazenamento de ofertas coletadas"
    }
  ]);
  const [testando, setTestando] = useState<string | null>(null);

  const testarWebhook = async (endpoint: string) => {
    setTestando(endpoint);
    
    try {
      const { data, error } = await supabase.functions.invoke(endpoint, {
        body: endpoint === 'usuarios-whatsapp' 
          ? { telefone: '+5511999999999', acao: 'teste' }
          : endpoint === 'ofertas-personalizadas'
          ? { telefone_usuario: '+5511999999999' }
          : { supermercado_id: 'test', ofertas_extraidas: [], url_pdf: null }
      });

      if (error) throw error;

      toast({
        title: "Webhook Testado",
        description: `${endpoint} está funcionando corretamente!`
      });

      // Atualizar status do webhook
      setWebhooks(prev => prev.map(w => 
        w.endpoint === endpoint 
          ? { ...w, status: 'online' as const, ultimaExecucao: new Date().toLocaleString('pt-BR') }
          : w
      ));

    } catch (error) {
      console.error('Erro ao testar webhook:', error);
      
      toast({
        title: "Erro no Webhook",
        description: `Falha ao testar ${endpoint}`,
        variant: "destructive"
      });

      // Atualizar status do webhook
      setWebhooks(prev => prev.map(w => 
        w.endpoint === endpoint 
          ? { ...w, status: 'error' as const, ultimaExecucao: new Date().toLocaleString('pt-BR') }
          : w
      ));
    } finally {
      setTestando(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'online':
        return <Badge variant="default">Online</Badge>;
      case 'error':
        return <Badge variant="destructive">Erro</Badge>;
      default:
        return <Badge variant="secondary">Offline</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5" />
          Monitor de Edge Functions
        </CardTitle>
        <CardDescription>
          Status e teste das Edge Functions do sistema
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {webhooks.map((webhook) => (
            <div key={webhook.endpoint} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  {getStatusIcon(webhook.status)}
                  <h3 className="font-semibold">{webhook.nome}</h3>
                  {getStatusBadge(webhook.status)}
                </div>
                <p className="text-sm text-muted-foreground">
                  {webhook.descricao}
                </p>
                <div className="text-xs text-muted-foreground space-y-1">
                  <div>Última execução: {webhook.ultimaExecucao}</div>
                  <div>Próxima execução: {webhook.proximaExecucao}</div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => testarWebhook(webhook.endpoint)}
                  disabled={testando === webhook.endpoint}
                  className="gap-2"
                >
                  {testando === webhook.endpoint ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                  Testar
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};