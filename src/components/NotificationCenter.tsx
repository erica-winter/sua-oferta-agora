import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bell, Check, X, AlertCircle, Info, CheckCircle, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Notification {
  id: string;
  tipo: 'info' | 'success' | 'warning' | 'error';
  titulo: string;
  mensagem: string;
  timestamp: string;
  lida: boolean;
}

export const NotificationCenter = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    generateMockNotifications();
    
    // Simular notificações em tempo real
    const interval = setInterval(() => {
      addRandomNotification();
    }, 60000); // Nova notificação a cada minuto

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const unread = notifications.filter(n => !n.lida).length;
    setUnreadCount(unread);
  }, [notifications]);

  const generateMockNotifications = () => {
    const mockNotifications: Notification[] = [
      {
        id: '1',
        tipo: 'success',
        titulo: 'Ofertas Processadas',
        mensagem: '127 novas ofertas foram coletadas do Carrefour',
        timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 min atrás
        lida: false
      },
      {
        id: '2',
        tipo: 'info',
        titulo: 'Novo Usuário',
        mensagem: 'Usuário +5511999887766 se cadastrou via WhatsApp',
        timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 min atrás
        lida: false
      },
      {
        id: '3',
        tipo: 'warning',
        titulo: 'PDF Pendente',
        mensagem: 'Encarte do Extra necessita processamento manual',
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 min atrás
        lida: true
      },
      {
        id: '4',
        tipo: 'error',
        titulo: 'Falha no Crawler',
        mensagem: 'Erro ao acessar site do Pão de Açúcar',
        timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(), // 1h atrás
        lida: true
      }
    ];
    
    setNotifications(mockNotifications);
  };

  const addRandomNotification = () => {
    const notificationTypes = [
      {
        tipo: 'success' as const,
        titulo: 'Processamento Concluído',
        mensagem: `${Math.floor(Math.random() * 200 + 50)} ofertas processadas com sucesso`
      },
      {
        tipo: 'info' as const,
        titulo: 'Sistema Atualizado',
        mensagem: 'Últimas estatísticas atualizadas'
      },
      {
        tipo: 'warning' as const,
        titulo: 'Atenção Necessária',
        mensagem: 'Alguns PDFs necessitam revisão manual'
      }
    ];

    const randomNotification = notificationTypes[Math.floor(Math.random() * notificationTypes.length)];
    
    const newNotification: Notification = {
      id: Date.now().toString(),
      ...randomNotification,
      timestamp: new Date().toISOString(),
      lida: false
    };

    setNotifications(prev => [newNotification, ...prev.slice(0, 9)]); // Manter apenas 10 notificações
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, lida: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, lida: true }))
    );
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getIcon = (tipo: string) => {
    switch (tipo) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getBadgeVariant = (tipo: string) => {
    switch (tipo) {
      case 'success':
        return 'default';
      case 'error':
        return 'destructive';
      case 'warning':
        return 'secondary';
      default:
        return 'outline';
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

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs flex items-center justify-center"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </Badge>
        )}
      </Button>

      {showNotifications && (
        <Card className="absolute top-12 right-0 w-80 z-50 shadow-lg border">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Notificações</CardTitle>
              <div className="flex gap-2">
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={markAllAsRead}
                    className="text-xs"
                  >
                    Marcar todas como lidas
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowNotifications(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <CardDescription>
              {unreadCount > 0 ? `${unreadCount} não lidas` : 'Todas as notificações foram lidas'}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-80">
              {notifications.length === 0 ? (
                <p className="text-center text-muted-foreground py-8 text-sm">
                  Nenhuma notificação
                </p>
              ) : (
                <div className="space-y-1">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-3 border-b last:border-0 hover:bg-muted/50 transition-colors ${
                        !notification.lida ? 'bg-accent/20' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-1">
                          {getIcon(notification.tipo)}
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-medium">{notification.titulo}</h4>
                            <Badge variant={getBadgeVariant(notification.tipo)} className="text-xs">
                              {notification.tipo}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {notification.mensagem}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">
                              {formatTimestamp(notification.timestamp)}
                            </span>
                            <div className="flex gap-1">
                              {!notification.lida && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => markAsRead(notification.id)}
                                  className="h-6 w-6 p-0"
                                >
                                  <Check className="h-3 w-3" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeNotification(notification.id)}
                                className="h-6 w-6 p-0"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
};