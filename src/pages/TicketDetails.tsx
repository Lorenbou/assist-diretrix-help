import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { storage } from '@/lib/storage';
import { Ticket, TicketStatus } from '@/types/ticket';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Calendar, User, Tag, AlertTriangle, Clock, CheckCircle, AlertCircle, Bug, HelpCircle } from 'lucide-react';

const TicketDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (id) {
      const foundTicket = storage.getTicketById(id);
      if (foundTicket) {
        setTicket(foundTicket);
      } else {
        toast({
          variant: "destructive",
          title: "Chamado não encontrado",
          description: "O chamado solicitado não existe ou foi removido",
        });
        navigate('/dashboard');
      }
    }
  }, [id, navigate, toast]);

  const handleStatusUpdate = async (newStatus: TicketStatus) => {
    if (!ticket) return;

    setIsUpdating(true);

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));

      const updatedTicket = storage.updateTicketStatus(ticket.id, newStatus);
      
      if (updatedTicket) {
        setTicket(updatedTicket);
        toast({
          title: "Status atualizado!",
          description: `Chamado marcado como "${newStatus}"`,
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível atualizar o status do chamado",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  if (!ticket) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando chamado...</p>
        </div>
      </div>
    );
  }

  const getStatusIcon = (status: TicketStatus) => {
    switch (status) {
      case 'Aberto': return <AlertCircle className="h-4 w-4" />;
      case 'Em andamento': return <Clock className="h-4 w-4" />;
      case 'Concluído': return <CheckCircle className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: TicketStatus) => {
    switch (status) {
      case 'Aberto': return 'bg-status-open text-white';
      case 'Em andamento': return 'bg-status-progress text-white';
      case 'Concluído': return 'bg-status-completed text-white';
    }
  };

  const getTypeIcon = (type: string) => {
    return type === 'Bug' ? <Bug className="h-4 w-4" /> : <HelpCircle className="h-4 w-4" />;
  };

  const getTypeColor = (type: string) => {
    return type === 'Bug' ? 'bg-type-bug text-white' : 'bg-type-doubt text-white';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getAvailableStatusOptions = () => {
    const options: TicketStatus[] = [];
    
    if (ticket.status !== 'Aberto') options.push('Aberto');
    if (ticket.status !== 'Em andamento') options.push('Em andamento');
    if (ticket.status !== 'Concluído') options.push('Concluído');
    
    return options;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/dashboard')}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar para Dashboard
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Chamado #{ticket.id}
              </h1>
              <p className="text-muted-foreground">Detalhes e gerenciamento</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Status Update Card */}
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-primary" />
                Alterar Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground mb-1">Status Atual</p>
                  <Badge className={`gap-2 text-sm ${getStatusColor(ticket.status)}`}>
                    {getStatusIcon(ticket.status)}
                    {ticket.status}
                  </Badge>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground mb-2">Alterar para:</p>
                  <Select
                    value=""
                    onValueChange={(value) => handleStatusUpdate(value as TicketStatus)}
                    disabled={isUpdating}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecionar novo status" />
                    </SelectTrigger>
                    <SelectContent>
                      {getAvailableStatusOptions().map((status) => (
                        <SelectItem key={status} value={status}>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(status)}
                            {status}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Main Ticket Info */}
          <Card className="shadow-lg">
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <Badge className={`gap-1 ${getTypeColor(ticket.type)}`}>
                      {getTypeIcon(ticket.type)}
                      {ticket.type}
                    </Badge>
                    <Badge className={`gap-1 ${getStatusColor(ticket.status)}`}>
                      {getStatusIcon(ticket.status)}
                      {ticket.status}
                    </Badge>
                  </div>
                  <CardTitle className="text-2xl mb-2">{ticket.title}</CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Metadata */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Usuário</p>
                    <p className="font-semibold">{ticket.username}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Criado em</p>
                    <p className="font-semibold text-sm">{formatDate(ticket.createdAt)}</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Description */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  Descrição Detalhada
                </h3>
                <div className="bg-muted/30 rounded-lg p-4">
                  <p className="whitespace-pre-wrap leading-relaxed">{ticket.description}</p>
                </div>
              </div>

              {/* Timeline hint */}
              <div className="bg-card border rounded-lg p-4">
                <h4 className="font-medium mb-2">Histórico do Chamado</h4>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span>Criado: {formatDate(ticket.createdAt)}</span>
                  </div>
                </div>
                {ticket.status !== 'Aberto' && (
                  <div className="flex items-center gap-3 text-sm text-muted-foreground mt-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        ticket.status === 'Em andamento' ? 'bg-status-progress' : 'bg-status-completed'
                      }`}></div>
                      <span>Status atual: {ticket.status}</span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button
              onClick={() => navigate('/dashboard')}
              variant="outline"
              className="flex-1"
            >
              Voltar ao Dashboard
            </Button>
            <Button
              onClick={() => navigate('/criar-chamado')}
              className="flex-1 bg-primary hover:bg-primary/90"
            >
              Criar Novo Chamado
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketDetails;