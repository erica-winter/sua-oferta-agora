import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Activity, TrendingUp, Users, Package } from "lucide-react";

interface Stats {
  totalUsuarios: number;
  usuariosAtivos: number;
  totalOfertas: number;
  ofertasHoje: number;
  totalSupermercados: number;
  supermercadosAtivos: number;
}

export const RealtimeStats = () => {
  const [stats, setStats] = useState<Stats>({
    totalUsuarios: 0,
    usuariosAtivos: 0,
    totalOfertas: 0,
    ofertasHoje: 0,
    totalSupermercados: 0,
    supermercadosAtivos: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
    
    // Atualizar stats a cada 30 segundos
    const interval = setInterval(loadStats, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const loadStats = async () => {
    try {
      const hoje = new Date().toISOString().split('T')[0];
      
      // Contar usuários
      const { count: totalUsuarios } = await supabase
        .from('usuarios')
        .select('*', { count: 'exact', head: true });
      
      const { count: usuariosAtivos } = await supabase
        .from('usuarios')
        .select('*', { count: 'exact', head: true })
        .eq('ativo', true);

      // Contar ofertas
      const { count: totalOfertas } = await supabase
        .from('ofertas')
        .select('*', { count: 'exact', head: true })
        .gte('data_fim_validade', hoje);

      const { count: ofertasHoje } = await supabase
        .from('ofertas')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', hoje);

      // Contar supermercados
      const { count: totalSupermercados } = await supabase
        .from('supermercados')
        .select('*', { count: 'exact', head: true });

      setStats({
        totalUsuarios: totalUsuarios || 0,
        usuariosAtivos: usuariosAtivos || 0,
        totalOfertas: totalOfertas || 0,
        ofertasHoje: ofertasHoje || 0,
        totalSupermercados: totalSupermercados || 0,
        supermercadosAtivos: totalSupermercados || 0
      });
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 bg-muted rounded w-24"></div>
              <div className="h-4 w-4 bg-muted rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-16"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Usuários Ativos</CardTitle>
          <Users className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.usuariosAtivos}</div>
          <p className="text-xs text-muted-foreground">
            de {stats.totalUsuarios} cadastrados
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Ofertas Válidas</CardTitle>
          <Package className="h-4 w-4 text-accent" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalOfertas}</div>
          <p className="text-xs text-muted-foreground">
            +{stats.ofertasHoje} hoje
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Supermercados</CardTitle>
          <Activity className="h-4 w-4 text-secondary-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalSupermercados}</div>
          <div className="flex items-center gap-1 mt-1">
            <Badge variant="default" className="text-xs">
              {stats.supermercadosAtivos} ativos
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Taxa Conversão</CardTitle>
          <TrendingUp className="h-4 w-4 text-accent" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.totalUsuarios > 0 
              ? Math.round((stats.usuariosAtivos / stats.totalUsuarios) * 100)
              : 0}%
          </div>
          <p className="text-xs text-muted-foreground">
            usuários ativos
          </p>
        </CardContent>
      </Card>
    </div>
  );
};