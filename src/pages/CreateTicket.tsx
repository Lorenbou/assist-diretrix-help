import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { storage } from '@/lib/storage';
import { TicketType } from '@/types/ticket';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { ArrowLeft, Send, Bug, HelpCircle } from 'lucide-react';

const CreateTicket = () => {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    username: user?.name || '',
    type: '' as TicketType | '',
    title: '',
    description: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Pre-fill form based on URL parameters and user info
    const tipo = searchParams.get('tipo');
    if (tipo === 'duvida') {
      setFormData(prev => ({ ...prev, type: 'Dúvida' }));
    } else if (tipo === 'bug') {
      setFormData(prev => ({ ...prev, type: 'Bug' }));
    }
    
    // Always use current user's name
    if (user?.name) {
      setFormData(prev => ({ ...prev, username: user.name }));
    }
  }, [searchParams, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.type) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Por favor, selecione o tipo do chamado",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      const ticket = storage.createTicket({
        username: formData.username,
        type: formData.type as TicketType,
        title: formData.title,
        description: formData.description
      });

      toast({
        title: "Chamado criado com sucesso!",
        description: `Chamado #${ticket.id} foi registrado no sistema`,
      });

      // Navigate based on user role
      if (user?.role === 'admin') {
        navigate('/dashboard');
      } else {
        navigate('/cliente-dashboard');
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível criar o chamado. Tente novamente.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleBack = () => {
    if (user?.role === 'admin') {
      navigate('/dashboard');
    } else {
      navigate('/cliente-dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={handleBack}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Criar Novo Chamado</h1>
              <p className="text-muted-foreground">Registre sua dúvida ou reporte um bug</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5 text-primary" />
                Informações do Chamado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="username">Nome do Usuário *</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Digite seu nome completo"
                    value={formData.username}
                    onChange={(e) => handleInputChange('username', e.target.value)}
                    required
                    className="h-11"
                    disabled={user?.role === 'client'} // Clients can't change their name
                  />
                  {user?.role === 'client' && (
                    <p className="text-sm text-muted-foreground">
                      Este campo é preenchido automaticamente com seu nome de usuário.
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Tipo do Chamado *</Label>
                  <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Selecione o tipo do chamado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Dúvida">
                        <div className="flex items-center gap-2">
                          <HelpCircle className="h-4 w-4 text-type-doubt" />
                          <span>Dúvida</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="Bug">
                        <div className="flex items-center gap-2">
                          <Bug className="h-4 w-4 text-type-bug" />
                          <span>Bug</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">
                    {formData.type === 'Dúvida' && "Escolha esta opção para esclarecer dúvidas sobre o uso do sistema"}
                    {formData.type === 'Bug' && "Escolha esta opção para reportar erros ou problemas técnicos"}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">Título do Chamado *</Label>
                  <Input
                    id="title"
                    type="text"
                    placeholder="Descreva brevemente o problema ou dúvida"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    required
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descrição Detalhada *</Label>
                  <Textarea
                    id="description"
                    placeholder="Descreva detalhadamente sua dúvida ou o problema encontrado. Inclua passos para reproduzir o erro, se aplicável."
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    required
                    rows={6}
                    className="resize-none"
                  />
                  <p className="text-sm text-muted-foreground">
                    Quanto mais detalhes você fornecer, mais rápido conseguiremos ajudá-lo
                  </p>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleBack}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 gap-2 bg-primary hover:bg-primary/90"
                  >
                    {isLoading ? (
                      "Criando..."
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        Criar Chamado
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Help Card */}
          <Card className="mt-6 border-primary/20 bg-primary/5">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
                  <HelpCircle className="h-4 w-4 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Dicas para um bom chamado:</h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Seja específico no título - isso ajuda na classificação</li>
                    <li>• Descreva passos detalhados para reproduzir problemas</li>
                    <li>• Inclua mensagens de erro, se houver</li>
                    <li>• Informe o navegador e sistema operacional usado</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CreateTicket;