import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Package, Users, Calendar } from "lucide-react";

interface ChartData {
  name: string;
  value: number;
  ofertas?: number;
  usuarios?: number;
}

export const ReportsCharts = () => {
  const [period, setPeriod] = useState<string>("7");
  const [ofertasPorDia, setOfertasPorDia] = useState<ChartData[]>([]);
  const [usuariosPorDia, setUsuariosPorDia] = useState<ChartData[]>([]);
  const [ofertasPorSupermercado, setOfertasPorSupermercado] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--accent))', 'hsl(var(--secondary))', '#8884d8', '#82ca9d', '#ffc658'];

  useEffect(() => {
    loadChartsData();
  }, [period]);

  const loadChartsData = async () => {
    setLoading(true);
    try {
      const daysAgo = parseInt(period);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysAgo);
      const startDateStr = startDate.toISOString().split('T')[0];

      // Ofertas por dia
      const { data: ofertasData } = await supabase
        .from('ofertas')
        .select('created_at')
        .gte('created_at', startDateStr)
        .order('created_at');

      // Usuários por dia  
      const { data: usuariosData } = await supabase
        .from('usuarios')
        .select('created_at')
        .gte('created_at', startDateStr)
        .order('created_at');

      // Ofertas por supermercado
      const { data: ofertasSupermercado } = await supabase
        .from('ofertas')
        .select(`
          supermercado_id,
          supermercado:supermercados(nome)
        `)
        .gte('created_at', startDateStr);

      // Processar dados para gráficos
      processOfertasPorDia(ofertasData || []);
      processUsuariosPorDia(usuariosData || []);
      processOfertasPorSupermercado(ofertasSupermercado || []);

    } catch (error) {
      console.error('Erro ao carregar dados dos gráficos:', error);
    } finally {
      setLoading(false);
    }
  };

  const processOfertasPorDia = (data: any[]) => {
    const groupedByDay = data.reduce((acc, item) => {
      const day = new Date(item.created_at).toLocaleDateString('pt-BR', { 
        day: '2-digit', 
        month: '2-digit' 
      });
      acc[day] = (acc[day] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const chartData: ChartData[] = Object.entries(groupedByDay).map(([day, count]) => ({
      name: day,
      value: count as number
    }));

    setOfertasPorDia(chartData);
  };

  const processUsuariosPorDia = (data: any[]) => {
    const groupedByDay = data.reduce((acc, item) => {
      const day = new Date(item.created_at).toLocaleDateString('pt-BR', { 
        day: '2-digit', 
        month: '2-digit' 
      });
      acc[day] = (acc[day] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const chartData: ChartData[] = Object.entries(groupedByDay).map(([day, count]) => ({
      name: day,
      value: count as number
    }));

    setUsuariosPorDia(chartData);
  };

  const processOfertasPorSupermercado = (data: any[]) => {
    const groupedByStore = data.reduce((acc, item) => {
      const storeName = item.supermercado?.nome || 'Desconhecido';
      acc[storeName] = (acc[storeName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const chartData: ChartData[] = Object.entries(groupedByStore)
      .map(([name, count]) => ({
        name,
        value: count as number
      }))
      .sort((a, b) => (b.value as number) - (a.value as number))
      .slice(0, 6); // Top 6 supermercados

    setOfertasPorSupermercado(chartData);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-32"></div>
                <div className="h-3 bg-muted rounded w-48"></div>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Relatórios e Análises</h2>
          <p className="text-muted-foreground">
            Visualize o desempenho do sistema nos últimos dias
          </p>
        </div>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Últimos 7 dias</SelectItem>
            <SelectItem value="15">Últimos 15 dias</SelectItem>
            <SelectItem value="30">Últimos 30 dias</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-accent" />
              Ofertas Coletadas por Dia
            </CardTitle>
            <CardDescription>
              Número de ofertas coletadas diariamente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={ofertasPorDia}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="hsl(var(--accent))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Usuários Cadastrados por Dia
            </CardTitle>
            <CardDescription>
              Novos usuários registrados diariamente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={usuariosPorDia}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--primary))" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-secondary-foreground" />
              Ofertas por Supermercado
            </CardTitle>
            <CardDescription>
              Distribuição de ofertas coletadas por supermercado
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={ofertasPorSupermercado}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {ofertasPorSupermercado.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>

              <div className="space-y-3">
                <h4 className="font-semibold">Ranking de Ofertas</h4>
                {ofertasPorSupermercado.map((item, index) => (
                  <div key={item.name} className="flex items-center justify-between p-2 border rounded">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      ></div>
                      <span className="text-sm font-medium">{item.name}</span>
                    </div>
                    <span className="text-sm font-bold">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};