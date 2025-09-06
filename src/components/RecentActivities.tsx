import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { Activity, User, Package, Store } from "lucide-react";

interface RecentActivity {
  id: string;
  tipo: 'usuario' | 'oferta' | 'supermercado';
  descricao: string;
  timestamp: string;
  detalhe?: string;
}

export const RecentActivities = () => {
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecentActivities();
    
    // Atualizar atividades a cada 60 segundos
    const interval = setInterval(loadRecentActivities, 60000);
    
    return () => clearInterval(interval);
  }, []);

  const loadRecentActivities = async () => {
    try {
      const activities: RecentActivity[] = [];
      
      // Buscar usuários recentes (últimas 24h)
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);
      
      const { data: usuariosRecentes } = await supabase
        .from('usuarios')
        .select('*')
        .gte('created_at', oneDayAgo.toISOString())
        .order('created_at', { ascending: false })
        .limit(5);

      if (usuariosRecentes) {
        usuariosRecentes.forEach(usuario => {
          activities.push({
            id: `user-${usuario.id}`,
            tipo: 'usuario',
            descricao: 'Novo usuário cadastrado',
            detalhe: usuario.telefone_whatsapp,
            timestamp: usuario.created_at
          });
        });
      }

      // Buscar ofertas recentes (últimas 24h)
      const { data: ofertasRecentes } = await supabase
        .from('ofertas')
        .select(`
          *,
          supermercado:supermercados(nome)
        `)
        .gte('created_at', oneDayAgo.toISOString())
        .order('created_at', { ascending: false })
        .limit(10);

      if (ofertasRecentes) {
        ofertasRecentes.forEach(oferta => {
          activities.push({
            id: `offer-${oferta.id}`,
            tipo: 'oferta',
            descricao: 'Nova oferta coletada',
            detalhe: `${oferta.nome_produto} - ${oferta.supermercado?.nome}`,
            timestamp: oferta.created_at
          });
        });
      }

      // Buscar supermercados recentes (últimas 24h)
      const { data: supermercadosRecentes } = await supabase
        .from('supermercados')
        .select('*')
        .gte('created_at', oneDayAgo.toISOString())
        .order('created_at', { ascending: false })
        .limit(3);

      if (supermercadosRecentes) {
        supermercadosRecentes.forEach(supermercado => {
          activities.push({
            id: `store-${supermercado.id}`,
            tipo: 'supermercado',
            descricao: 'Supermercado adicionado',
            detalhe: `${supermercado.nome} - ${supermercado.regiao}`,
            timestamp: supermercado.created_at
          });
        });
      }

      // Ordenar por timestamp mais recente
      activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      
      setActivities(activities.slice(0, 15)); // Mostrar apenas os 15 mais recentes
    } catch (error) {
      console.error('Erro ao carregar atividades recentes:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (tipo: string) => {
    switch (tipo) {
      case 'usuario':
        return <User className="h-4 w-4 text-primary" />;
      case 'oferta':
        return <Package className="h-4 w-4 text-accent" />;
      case 'supermercado':
        return <Store className="h-4 w-4 text-secondary-foreground" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getActivityBadge = (tipo: string) => {
    switch (tipo) {
      case 'usuario':
        return <Badge variant="outline">Usuário</Badge>;
      case 'oferta':
        return <Badge variant="secondary">Oferta</Badge>;
      case 'supermercado':
        return <Badge variant="default">Supermercado</Badge>;
      default:
        return <Badge variant="outline">Atividade</Badge>;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Agora';
    if (diffInMinutes < 60) return `${diffInMinutes}min atrás`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h atrás`;
    return date.toLocaleDateString('pt-BR');
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Atividades Recentes</CardTitle>
          <CardDescription>Carregando...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="h-4 w-4 bg-muted rounded"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Atividades Recentes
        </CardTitle>
        <CardDescription>
          Últimas atividades do sistema nas últimas 24 horas
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          <div className="space-y-4">
            {activities.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Nenhuma atividade recente encontrada
              </p>
            ) : (
              activities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 pb-3 border-b last:border-0">
                  <div className="mt-1">
                    {getActivityIcon(activity.tipo)}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-medium">{activity.descricao}</h4>
                      {getActivityBadge(activity.tipo)}
                    </div>
                    {activity.detalhe && (
                      <p className="text-xs text-muted-foreground">
                        {activity.detalhe}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {formatTimestamp(activity.timestamp)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};