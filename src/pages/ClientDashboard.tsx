import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { Plus, LogOut, MessageSquare, Clock, CheckCircle2, User } from 'lucide-react';

const ClientDashboard = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const features = [
    {
      icon: <Plus className="h-8 w-8 text-primary" />,
      title: 'Criar Novo Chamado',
      description: 'Registre uma dúvida ou reporte um problema no sistema',
      action: () => navigate('/criar-chamado'),
      buttonText: 'Criar Chamado',
      color: 'bg-primary/10 border-primary/20'
    },
    {
      icon: <MessageSquare className="h-8 w-8 text-type-doubt" />,
      title: 'Dúvidas',
      description: 'Tire suas dúvidas sobre o uso do sistema',
      action: () => navigate('/criar-chamado?tipo=duvida'),
      buttonText: 'Fazer Pergunta',
      color: 'bg-type-doubt/10 border-type-doubt/20'
    },
    {
      icon: <Clock className="h-8 w-8 text-type-bug" />,
      title: 'Reportar Bug',
      description: 'Encontrou um problema? Nos ajude a corrigir',
      action: () => navigate('/criar-chamado?tipo=bug'),
      buttonText: 'Reportar Bug',
      color: 'bg-type-bug/10 border-type-bug/20'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Portal do Cliente</h1>
              <p className="text-muted-foreground">
                Bem-vindo, <span className="font-medium">{user?.name}</span>
              </p>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="gap-2"
            >
              <LogOut className="h-4 w-4" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 bg-primary rounded-xl flex items-center justify-center">
                  <User className="h-6 w-6 text-primary-foreground" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold mb-2">Sistema de Atendimento Diretrix</h2>
                  <p className="text-muted-foreground mb-4">
                    Aqui você pode registrar suas dúvidas ou reportar problemas encontrados no sistema RP. 
                    Nossa equipe de suporte está sempre pronta para ajudá-lo.
                  </p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <CheckCircle2 className="h-4 w-4 text-status-completed" />
                      <span>Resposta rápida</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4 text-status-progress" />
                      <span>Atendimento especializado</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {features.map((feature, index) => (
            <Card 
              key={index}
              className={`hover:shadow-lg transition-all duration-200 cursor-pointer ${feature.color}`}
              onClick={feature.action}
            >
              <CardHeader className="pb-4">
                <div className="flex items-center justify-center mb-4">
                  <div className="h-16 w-16 bg-card rounded-2xl flex items-center justify-center shadow-sm">
                    {feature.icon}
                  </div>
                </div>
                <CardTitle className="text-center text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-muted-foreground text-center mb-4 text-sm">
                  {feature.description}
                </p>
                <Button 
                  className="w-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    feature.action();
                  }}
                >
                  {feature.buttonText}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Help Section */}
        <Card className="border-muted">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-muted-foreground" />
              Como funciona o atendimento?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2 text-type-doubt">Para Dúvidas:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Explique claramente sua dúvida</li>
                  <li>• Informe em qual tela do sistema você está</li>
                  <li>• Descreva o que você está tentando fazer</li>
                  <li>• Nossa equipe responderá o mais rápido possível</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2 text-type-bug">Para Bugs:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Descreva o problema encontrado</li>
                  <li>• Informe os passos que levaram ao erro</li>
                  <li>• Inclua mensagens de erro, se houver</li>
                  <li>• Mencione o navegador que está usando</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ClientDashboard;