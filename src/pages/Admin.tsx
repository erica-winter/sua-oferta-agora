import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, Eye, Store, Package, Users, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Supermercado {
  id: string;
  nome: string;
  regiao: string;
  cep_faixa_inicial: number;
  cep_faixa_final: number;
  url_ofertas: string | null;
  tipo_extracao: 'site' | 'pdf';
}

interface Oferta {
  id: string;
  nome_produto: string;
  preco: number;
  data_inicio_validade: string;
  data_fim_validade: string;
  supermercado: { nome: string };
}

interface Usuario {
  id: string;
  telefone_whatsapp: string;
  cep: number;
  plano: string;
  ativo: boolean;
}

const Admin = () => {
  const { toast } = useToast();
  const [supermercados, setSupermercados] = useState<Supermercado[]>([]);
  const [ofertas, setOfertas] = useState<Oferta[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(false);

  // Form states
  const [novoSupermercado, setNovoSupermercado] = useState({
    nome: '',
    regiao: '',
    cep_faixa_inicial: '',
    cep_faixa_final: '',
    url_ofertas: '',
    tipo_extracao: 'site' as 'site' | 'pdf'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Carregar supermercados
      const { data: supermercadosData } = await supabase
        .from('supermercados')
        .select('*')
        .order('nome');
      
      if (supermercadosData) setSupermercados(supermercadosData as Supermercado[]);

      // Carregar ofertas recentes
      const { data: ofertasData } = await supabase
        .from('ofertas')
        .select(`
          *,
          supermercado:supermercados(nome)
        `)
        .gte('data_fim_validade', new Date().toISOString().split('T')[0])
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (ofertasData) setOfertas(ofertasData);

      // Carregar usuários
      const { data: usuariosData } = await supabase
        .from('usuarios')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (usuariosData) setUsuarios(usuariosData);

    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao carregar dados",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const adicionarSupermercado = async () => {
    if (!novoSupermercado.nome || !novoSupermercado.regiao) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('supermercados')
        .insert([{
          nome: novoSupermercado.nome,
          regiao: novoSupermercado.regiao,
          cep_faixa_inicial: parseInt(novoSupermercado.cep_faixa_inicial),
          cep_faixa_final: parseInt(novoSupermercado.cep_faixa_final),
          url_ofertas: novoSupermercado.url_ofertas || null,
          tipo_extracao: novoSupermercado.tipo_extracao
        }]);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Supermercado adicionado com sucesso!"
      });

      setNovoSupermercado({
        nome: '',
        regiao: '',
        cep_faixa_inicial: '',
        cep_faixa_final: '',
        url_ofertas: '',
        tipo_extracao: 'site'
      });

      loadData();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao adicionar supermercado",
        variant: "destructive"
      });
    }
  };

  const removerSupermercado = async (id: string) => {
    try {
      const { error } = await supabase
        .from('supermercados')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Supermercado removido com sucesso!"
      });

      loadData();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao remover supermercado",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Store className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Dona Oferta - Administração</h1>
        </div>

        {/* Cards de estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Supermercados</CardTitle>
              <Store className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{supermercados.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ofertas Ativas</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{ofertas.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Usuários Ativos</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{usuarios.filter(u => u.ativo).length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taxa Conversão</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">85%</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="supermercados" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="supermercados">Supermercados</TabsTrigger>
            <TabsTrigger value="ofertas">Ofertas</TabsTrigger>
            <TabsTrigger value="usuarios">Usuários</TabsTrigger>
            <TabsTrigger value="configuracoes">Configurações</TabsTrigger>
          </TabsList>

          <TabsContent value="supermercados" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Adicionar Novo Supermercado</CardTitle>
                <CardDescription>
                  Configure um novo supermercado para coleta de ofertas
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="nome">Nome do Supermercado</Label>
                    <Input
                      id="nome"
                      value={novoSupermercado.nome}
                      onChange={(e) => setNovoSupermercado({...novoSupermercado, nome: e.target.value})}
                      placeholder="Ex: Carrefour, Extra, Pão de Açúcar"
                    />
                  </div>

                  <div>
                    <Label htmlFor="regiao">Região</Label>
                    <Input
                      id="regiao"
                      value={novoSupermercado.regiao}
                      onChange={(e) => setNovoSupermercado({...novoSupermercado, regiao: e.target.value})}
                      placeholder="Ex: São Paulo - SP"
                    />
                  </div>

                  <div>
                    <Label htmlFor="cep_inicial">CEP Inicial</Label>
                    <Input
                      id="cep_inicial"
                      value={novoSupermercado.cep_faixa_inicial}
                      onChange={(e) => setNovoSupermercado({...novoSupermercado, cep_faixa_inicial: e.target.value})}
                      placeholder="01000000"
                    />
                  </div>

                  <div>
                    <Label htmlFor="cep_final">CEP Final</Label>
                    <Input
                      id="cep_final"
                      value={novoSupermercado.cep_faixa_final}
                      onChange={(e) => setNovoSupermercado({...novoSupermercado, cep_faixa_final: e.target.value})}
                      placeholder="05999999"
                    />
                  </div>

                  <div>
                    <Label htmlFor="url_ofertas">URL das Ofertas (opcional)</Label>
                    <Input
                      id="url_ofertas"
                      value={novoSupermercado.url_ofertas}
                      onChange={(e) => setNovoSupermercado({...novoSupermercado, url_ofertas: e.target.value})}
                      placeholder="https://site.com/ofertas"
                    />
                  </div>

                  <div>
                    <Label htmlFor="tipo_extracao">Tipo de Extração</Label>
                    <Select
                      value={novoSupermercado.tipo_extracao}
                      onValueChange={(value: 'site' | 'pdf') => setNovoSupermercado({...novoSupermercado, tipo_extracao: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="site">Site (Web Scraping)</SelectItem>
                        <SelectItem value="pdf">PDF (Upload Manual)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button onClick={adicionarSupermercado} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Supermercado
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Supermercados Cadastrados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {supermercados.map((supermercado) => (
                    <div key={supermercado.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{supermercado.nome}</h3>
                          <Badge variant={supermercado.tipo_extracao === 'site' ? 'default' : 'secondary'}>
                            {supermercado.tipo_extracao}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{supermercado.regiao}</p>
                        <p className="text-xs text-muted-foreground">
                          CEP: {supermercado.cep_faixa_inicial} - {supermercado.cep_faixa_final}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => removerSupermercado(supermercado.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ofertas" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Ofertas Recentes</CardTitle>
                <CardDescription>
                  Últimas ofertas coletadas pelos crawlers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {ofertas.map((oferta) => (
                    <div key={oferta.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <h3 className="font-semibold">{oferta.nome_produto}</h3>
                        <p className="text-sm text-muted-foreground">
                          {oferta.supermercado?.nome}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Válido até: {new Date(oferta.data_fim_validade).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-accent">
                          R$ {oferta.preco.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="usuarios" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Usuários Cadastrados</CardTitle>
                <CardDescription>
                  Usuários registrados no sistema via WhatsApp
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {usuarios.map((usuario) => (
                    <div key={usuario.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <h3 className="font-semibold">{usuario.telefone_whatsapp}</h3>
                        <p className="text-sm text-muted-foreground">
                          CEP: {usuario.cep}
                        </p>
                        <div className="flex gap-2">
                          <Badge variant={usuario.plano === 'premium' ? 'default' : 'secondary'}>
                            {usuario.plano}
                          </Badge>
                          <Badge variant={usuario.ativo ? 'default' : 'destructive'}>
                            {usuario.ativo ? 'Ativo' : 'Inativo'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="configuracoes" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Configurações do Sistema</CardTitle>
                <CardDescription>
                  Configurações gerais e integração com n8n
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label>Status dos Crawlers</Label>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="default">Ativo</Badge>
                      <span className="text-sm text-muted-foreground">
                        Última execução: Hoje às 08:00
                      </span>
                    </div>
                  </div>

                  <div>
                    <Label>WhatsApp API (WAHA)</Label>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="default">Conectado</Badge>
                      <span className="text-sm text-muted-foreground">
                        Status: Online
                      </span>
                    </div>
                  </div>

                  <div>
                    <Label>n8n Workflows</Label>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="default">6 Ativos</Badge>
                      <span className="text-sm text-muted-foreground">
                        Última sincronização: 2 min atrás
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;