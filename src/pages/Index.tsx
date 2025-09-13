import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  MessageSquare, 
  ShoppingCart, 
  Target, 
  Clock, 
  Shield, 
  Users, 
  CheckCircle,
  ArrowRight,
  Star,
  Smartphone,
  Zap,
  Heart
} from "lucide-react";
import { ContactForm } from "@/components/ContactForm";
import heroImage from "@/assets/hero-dona-oferta.jpg";

const Index = () => {
  const whatsappNumber = "5511999999999"; // Número do WhatsApp da Dona Oferta
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=Olá! Quero receber ofertas personalizadas de supermercados!`;

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-background/95 backdrop-blur-sm border-b z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MessageSquare className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold">Dona Oferta</span>
            </div>
            <div className="hidden md:flex items-center gap-6">
              <a href="#como-funciona" className="text-muted-foreground hover:text-primary transition-colors font-medium">
                Como Funciona
              </a>
              <a href="#beneficios" className="text-muted-foreground hover:text-primary transition-colors font-medium">
                Benefícios
              </a>
              <a href="#contato" className="text-muted-foreground hover:text-primary transition-colors font-medium">
                Contato
              </a>
              <Button asChild className="gap-2 shadow-lg hover:shadow-xl transition-all">
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                  <MessageSquare className="h-4 w-4" />
                  Começar Agora
                </a>
              </Button>
            </div>
            
            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <Button asChild size="sm" className="gap-2">
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                  <MessageSquare className="h-4 w-4" />
                  WhatsApp
                </a>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-16 bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge variant="outline" className="w-fit">
                  🎯 Ofertas Personalizadas
                </Badge>
                <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
                  Receba as melhores 
                  <span className="text-primary"> ofertas </span>
                  no seu WhatsApp
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed">
                  Economize tempo e dinheiro! Receba ofertas personalizadas dos melhores 
                  supermercados da sua região direto no WhatsApp, sem precisar ficar procurando.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg" className="gap-2 text-lg px-8 py-6">
                  <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                    <MessageSquare className="h-5 w-5" />
                    Começar Grátis no WhatsApp
                    <ArrowRight className="h-5 w-5" />
                  </a>
                </Button>
                <Button variant="outline" size="lg" className="gap-2 text-lg px-8 py-6" asChild>
                  <a href="#como-funciona">
                    <Clock className="h-5 w-5" />
                    Ver Como Funciona
                  </a>
                </Button>
              </div>

              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Grátis por 60 dias</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Sem compromisso</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Cancelar quando quiser</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <img 
                src={heroImage} 
                alt="Ofertas personalizadas no WhatsApp - Dona Oferta"
                className="w-full h-auto rounded-2xl shadow-2xl"
              />
              <div className="absolute -bottom-4 -left-4 bg-white p-4 rounded-lg shadow-lg border">
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-primary" />
                  <span className="font-medium">+10.000 usuários ativos</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Como Funciona */}
      <section id="como-funciona" className="py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Como Funciona</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Em apenas 3 passos você já começa a economizar nas suas compras
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <MessageSquare className="h-8 w-8 text-primary" />
              </div>
              <div className="relative">
                <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2">1</Badge>
                <h3 className="text-xl font-semibold mt-4">Mande uma Mensagem</h3>
              </div>
              <p className="text-muted-foreground">
                Clique no botão do WhatsApp e envie uma mensagem. Nosso sistema vai te cadastrar automaticamente.
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Target className="h-8 w-8 text-primary" />
              </div>
              <div className="relative">
                <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2">2</Badge>
                <h3 className="text-xl font-semibold mt-4">Personalize Suas Preferências</h3>
              </div>
              <p className="text-muted-foreground">
                Informe seu CEP e escolha como quer receber as ofertas: texto simples ou PDF com encartes.
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <ShoppingCart className="h-8 w-8 text-primary" />
              </div>
              <div className="relative">
                <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2">3</Badge>
                <h3 className="text-xl font-semibold mt-4">Receba e Economize</h3>
              </div>
              <p className="text-muted-foreground">
                Receba ofertas personalizadas diariamente e economize nas suas compras sem esforço.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefícios */}
      <section id="beneficios" className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Por que Escolher a Dona Oferta?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              A forma mais inteligente de economizar nas suas compras
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-0 shadow-md">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Smartphone className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>100% no WhatsApp</CardTitle>
                <CardDescription>
                  Tudo funciona no app que você já usa todos os dias. Sem precisar baixar nada novo!
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-md">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Ofertas Personalizadas</CardTitle>
                <CardDescription>
                  Receba apenas ofertas dos supermercados da sua região, filtradas para você.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-md">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Atualização Automática</CardTitle>
                <CardDescription>
                  Nossa inteligência artificial coleta ofertas diariamente dos melhores supermercados.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-md">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Economize Tempo</CardTitle>
                <CardDescription>
                  Pare de perder tempo procurando ofertas. Receba tudo mastigadinho no seu celular.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-md">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Teste Grátis</CardTitle>
                <CardDescription>
                  60 dias completamente grátis para você testar e ver como funciona na prática.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-md">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Heart className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Sem Compromisso</CardTitle>
                <CardDescription>
                  Cancele quando quiser, sem burocracias. Sua satisfação é nossa prioridade.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">O que nossos usuários dizem</h2>
            <div className="flex items-center justify-center gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-6 w-6 fill-yellow-400 text-yellow-400" />
              ))}
              <span className="ml-3 text-lg text-muted-foreground font-medium">4.9/5 baseado em +500 avaliações</span>
            </div>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Veja como a Dona Oferta já transformou a vida de milhares de pessoas
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-md">
              <CardContent className="pt-6">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4">
                  "Incrível como economizo tempo e dinheiro! Recebo as melhores ofertas direto no WhatsApp sem precisar ficar procurando."
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Maria Silva</p>
                    <p className="text-sm text-muted-foreground">São Paulo, SP</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md">
              <CardContent className="pt-6">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4">
                  "Já economizei mais de R$ 200 só no primeiro mês! As ofertas são realmente dos supermercados da minha região."
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">João Santos</p>
                    <p className="text-sm text-muted-foreground">Rio de Janeiro, RJ</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md">
              <CardContent className="pt-6">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4">
                  "Praticidade total! Recebo no formato PDF que eu prefiro e posso levar o encarte no celular para o supermercado."
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Ana Costa</p>
                    <p className="text-sm text-muted-foreground">Belo Horizonte, MG</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Pronto para Economizar?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Comece agora mesmo! É grátis por 60 dias e você pode cancelar quando quiser.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" variant="secondary" className="gap-2 text-lg px-8 py-6">
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                <MessageSquare className="h-5 w-5" />
                Começar Grátis Agora
                <ArrowRight className="h-5 w-5" />
              </a>
            </Button>
          </div>
          <p className="text-sm mt-6 opacity-75">
            ✓ Sem cartão de crédito ✓ Sem compromisso ✓ Cancelar quando quiser
          </p>
        </div>
      </section>

      {/* Contact Form */}
      <ContactForm />

      {/* Footer */}
      <footer className="bg-muted/50 border-t">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <MessageSquare className="h-6 w-6 text-primary" />
                <span className="text-lg font-bold">Dona Oferta</span>
              </div>
              <p className="text-muted-foreground">
                Ofertas personalizadas de supermercados direto no seu WhatsApp.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Produto</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#como-funciona" className="hover:text-primary transition-colors">Como Funciona</a></li>
                <li><a href="#beneficios" className="hover:text-primary transition-colors">Benefícios</a></li>
                <li><a href="/dashboard" className="hover:text-primary transition-colors">Dashboard</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Suporte</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#contato" className="hover:text-primary transition-colors">Contato</a></li>
                <li><a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">WhatsApp</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">FAQ</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Termos de Uso</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Privacidade</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Cookies</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t mt-8 pt-8 text-center text-muted-foreground">
            <p>&copy; 2024 Dona Oferta. Todos os direitos reservados.</p>
            <p className="text-sm mt-2">
              🚀 Desenvolvido com carinho para economizar seu tempo e dinheiro
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;