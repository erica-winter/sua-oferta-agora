import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Store, Users, Package, ArrowRight, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary/10 to-accent/10">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="text-center space-y-6">
            <div className="flex items-center justify-center gap-3 mb-6">
              <MessageSquare className="h-12 w-12 text-primary" />
              <h1 className="text-5xl font-bold">Dona Oferta</h1>
            </div>
            
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Sistema automatizado que coleta ofertas de supermercados e envia de forma personalizada 
              para usuários via WhatsApp. Transforme a experiência de compras dos seus clientes!
            </p>
            
            <div className="flex gap-4 justify-center mt-8">
              <Link to="/dashboard">
                <Button size="lg" className="gap-2">
                  <Store className="h-5 w-5" />
                  Acessar Dashboard
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              
              <Link to="/admin">
                <Button size="lg" variant="outline" className="gap-2">
                  <Package className="h-5 w-5" />
                  Administração
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Funcionalidades Principais</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Store className="h-6 w-6 text-primary" />
                Coleta Automatizada
              </CardTitle>
              <CardDescription>
                Sistema coleta ofertas automaticamente de sites e PDFs de supermercados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-accent" />
                  Web scraping de sites
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-accent" />
                  Extração de PDFs
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-accent" />
                  Execução diária automatizada
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-6 w-6 text-primary" />
                WhatsApp Integrado
              </CardTitle>
              <CardDescription>
                Comunicação direta com usuários via WhatsApp com onboarding automático
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-accent" />
                  Cadastro via WhatsApp
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-accent" />
                  Envio personalizado
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-accent" />
                  Formato texto ou PDF
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-6 w-6 text-primary" />
                Gestão de Usuários
              </CardTitle>
              <CardDescription>
                Sistema de assinaturas com período trial e planos premium
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-accent" />
                  60 dias de trial gratuito
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-accent" />
                  Planos Básico e Premium
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-accent" />
                  Gestão via StarkBank
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Architecture Section */}
      <div className="bg-muted/30">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <h2 className="text-3xl font-bold text-center mb-12">Arquitetura do Sistema</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-lg">n8n Workflows</CardTitle>
                <CardDescription>Orquestração central de todos os processos</CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-lg">Supabase Backend</CardTitle>
                <CardDescription>Banco de dados e storage para PDFs</CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-lg">WAHA WhatsApp</CardTitle>
                <CardDescription>API para comunicação WhatsApp</CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-lg">Python Scripts</CardTitle>
                <CardDescription>Web scraping e extração de PDFs</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-primary text-primary-foreground">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-2">Dona Oferta</h3>
            <p className="text-primary-foreground/80">
              Sistema automatizado de ofertas via WhatsApp
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
