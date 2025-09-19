import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Send, Bug, HelpCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { ticketService } from '@/lib/tickets';
import { CreateTicketData } from '@/types/ticket';

const CreateTicket = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'question' | 'bug'>('question');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [isLoading, setIsLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const urlType = searchParams.get('tipo');
    if (urlType === 'bug') {
      setType('bug');
    } else if (urlType === 'question') {
      setType('question');
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const ticketData: CreateTicketData = {
        title,
        description,
        type,
        priority,
      };

      await ticketService.createTicket(ticketData);
      
      toast({
        title: "Chamado criado com sucesso!",
        description: "Sua solicitação foi registrada e será analisada pela equipe.",
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
        title: "Erro ao criar chamado",
        description: error instanceof Error ? error.message : "Tente novamente.",
      });
    } finally {
      setIsLoading(false);
    }
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
              onClick={handleBack}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Criar Novo Chamado</h1>
              <p className="text-muted-foreground">
                Registre sua solicitação de suporte técnico
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {type === 'bug' ? (
                  <Bug className="h-5 w-5 text-type-bug" />
                ) : (
                  <HelpCircle className="h-5 w-5 text-type-doubt" />
                )}
                Detalhes do Chamado
              </CardTitle>
              <CardDescription>
                Preencha as informações abaixo para que possamos ajudá-lo da melhor forma possível
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">Tipo de Solicitação</Label>
                    <Select value={type} onValueChange={(value: 'question' | 'bug') => setType(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="question">
                          <div className="flex items-center gap-2">
                            <HelpCircle className="h-4 w-4 text-type-doubt" />
                            Dúvida
                          </div>
                        </SelectItem>
                        <SelectItem value="bug">
                          <div className="flex items-center gap-2">
                            <Bug className="h-4 w-4 text-type-bug" />
                            Bug/Problema
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="priority">Prioridade</Label>
                    <Select value={priority} onValueChange={(value: 'low' | 'medium' | 'high' | 'urgent') => setPriority(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Baixa</SelectItem>
                        <SelectItem value="medium">Média</SelectItem>
                        <SelectItem value="high">Alta</SelectItem>
                        <SelectItem value="urgent">Urgente</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">Título do Chamado</Label>
                  <Input
                    id="title"
                    placeholder="Descreva brevemente o problema ou dúvida"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    maxLength={100}
                  />
                  <p className="text-xs text-muted-foreground">
                    {title.length}/100 caracteres
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descrição Detalhada</Label>
                  <Textarea
                    id="description"
                    placeholder={
                      type === 'bug'
                        ? "Descreva o problema encontrado, os passos para reproduzi-lo e o comportamento esperado..."
                        : "Explique sua dúvida em detalhes, em qual parte do sistema está e o que está tentando fazer..."
                    }
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    rows={6}
                    maxLength={1000}
                  />
                  <p className="text-xs text-muted-foreground">
                    {description.length}/1000 caracteres
                  </p>
                </div>

                <div className="bg-muted/50 rounded-lg p-4 border border-border/50">
                  <h4 className="font-semibold mb-2 text-sm">
                    {type === 'bug' ? 'Dicas para reportar bugs:' : 'Dicas para fazer perguntas:'}
                  </h4>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    {type === 'bug' ? (
                      <>
                        <li>• Descreva exatamente o que aconteceu</li>
                        <li>• Informe os passos que levaram ao problema</li>
                        <li>• Mencione mensagens de erro, se houver</li>
                        <li>• Inclua o navegador e sistema operacional</li>
                      </>
                    ) : (
                      <>
                        <li>• Seja específico sobre sua dúvida</li>
                        <li>• Informe em qual tela ou função está</li>
                        <li>• Descreva o que está tentando fazer</li>
                        <li>• Mencione se já tentou alguma solução</li>
                      </>
                    )}
                  </ul>
                </div>

                <Button 
                  type="submit" 
                  className="w-full gap-2"
                  disabled={isLoading}
                >
                  <Send className="h-4 w-4" />
                  {isLoading ? "Criando chamado..." : "Criar Chamado"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CreateTicket;