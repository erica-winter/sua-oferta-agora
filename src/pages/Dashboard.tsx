import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageSquare, Store, Package, Users, BarChart3, Settings } from "lucide-react";

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <MessageSquare className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Dona Oferta - Dashboard</h1>
        </div>

        {/* Cards de visão geral */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Store className="h-5 w-5 text-primary" />
                Sistema de Ofertas
              </CardTitle>
              <CardDescription>
                Coleta automatizada de ofertas de supermercados via WhatsApp
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Status do Sistema</span>
                  <Badge variant="default">Operacional</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Supermercados Ativos</span>
                  <span className="font-semibold">12</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Ofertas Coletadas Hoje</span>
                  <span className="font-semibold">347</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-accent" />
                Usuários WhatsApp
              </CardTitle>
              <CardDescription>
                Estatísticas dos usuários cadastrados no bot
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Usuários Ativos</span>
                  <span className="font-semibold">1,247</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Novos Hoje</span>
                  <span className="font-semibold">23</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Taxa de Conversão</span>
                  <span className="font-semibold">85%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-secondary-foreground" />
                Automação n8n
              </CardTitle>
              <CardDescription>
                Status dos workflows automatizados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Workflows Ativos</span>
                  <span className="font-semibold">6</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Última Execução</span>
                  <span className="font-semibold">2 min atrás</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Taxa de Sucesso</span>
                  <Badge variant="default">98.5%</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Seção de workflows */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Workflows n8n Ativos</CardTitle>
            <CardDescription>
              Monitoramento dos workflows automatizados do sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                {
                  nome: "Extração de Ofertas",
                  descricao: "Coleta diária de ofertas dos supermercados",
                  status: "Ativo",
                  ultimaExecucao: "Hoje às 08:00",
                  proximaExecucao: "Amanhã às 08:00"
                },
                {
                  nome: "Onboarding WhatsApp",
                  descricao: "Cadastro de novos usuários via WhatsApp",
                  status: "Ativo",
                  ultimaExecucao: "2 min atrás",
                  proximaExecucao: "Contínuo"
                },
                {
                  nome: "Envio de Ofertas",
                  descricao: "Envio personalizado de ofertas para usuários",
                  status: "Ativo",
                  ultimaExecucao: "Hoje às 09:00",
                  proximaExecucao: "Hoje às 18:00"
                },
                {
                  nome: "Gestão de Assinaturas",
                  descricao: "Controle de trials e pagamentos",
                  status: "Ativo",
                  ultimaExecucao: "Ontem às 23:59",
                  proximaExecucao: "Hoje às 23:59"
                },
                {
                  nome: "Alertas de Falha",
                  descricao: "Notificações para admin sobre erros",
                  status: "Ativo",
                  ultimaExecucao: "Nunca (bom sinal!)",
                  proximaExecucao: "Sob demanda"
                },
                {
                  nome: "Geração de PDFs",
                  descricao: "Criação de encartes customizados",
                  status: "Ativo",
                  ultimaExecucao: "Hoje às 08:30",
                  proximaExecucao: "Sob demanda"
                }
              ].map((workflow, index) => (
                <Card key={index} className="border">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-base">{workflow.nome}</CardTitle>
                      <Badge variant="default" className="text-xs">
                        {workflow.status}
                      </Badge>
                    </div>
                    <CardDescription className="text-sm">
                      {workflow.descricao}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2 text-xs text-muted-foreground">
                      <div>
                        <strong>Última execução:</strong> {workflow.ultimaExecucao}
                      </div>
                      <div>
                        <strong>Próxima execução:</strong> {workflow.proximaExecucao}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Seção de ações rápidas */}
        <Card>
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
            <CardDescription>
              Acesso direto às principais funcionalidades do sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button className="h-20 flex-col gap-2" variant="outline">
                <Store className="h-6 w-6" />
                <span>Gerenciar Supermercados</span>
              </Button>
              
              <Button className="h-20 flex-col gap-2" variant="outline">
                <Package className="h-6 w-6" />
                <span>Ver Ofertas</span>
              </Button>
              
              <Button className="h-20 flex-col gap-2" variant="outline">
                <Users className="h-6 w-6" />
                <span>Usuários</span>
              </Button>
              
              <Button className="h-20 flex-col gap-2" variant="outline">
                <BarChart3 className="h-6 w-6" />
                <span>Relatórios</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;