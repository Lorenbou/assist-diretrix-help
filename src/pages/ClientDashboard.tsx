import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { ticketService } from "@/lib/tickets";
import {
  getStatusConfig,
  getTypeConfig,
  formatTicketDate,
  formatTicketDueDate,
  isTicketOverdue,
} from "@/lib/ticketUtils";
import { Ticket } from "@/types/ticket";
import {
  Plus,
  LogOut,
  MessageSquare,
  Clock,
  CheckCircle2,
  User,
  Code2,
  Search,
  AlertCircle,
  Paperclip,
} from "lucide-react";

const ClientDashboard = () => {
  const navigate = useNavigate();
  const { signOut, user } = useAuth();
  const { toast } = useToast();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<Ticket[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<Ticket["type"] | "all">("all");
  const [statusFilter, setStatusFilter] = useState<
    "open" | "in_progress" | "closed" | "all"
  >("all");
  const [isLoadingTickets, setIsLoadingTickets] = useState(false);

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  useEffect(() => {
    if (!user?.id) return;

    const loadTickets = async () => {
      setIsLoadingTickets(true);
      try {
        const userTickets = await ticketService.getTickets({
          createdBy: user.id,
        });
        setTickets(userTickets);
      } catch (error) {
        console.error("Erro ao carregar chamados do cliente:", error);
        toast({
          variant: "destructive",
          title: "Não foi possível carregar seus chamados",
          description: "Tente novamente em instantes.",
        });
      } finally {
        setIsLoadingTickets(false);
      }
    };

    loadTickets();
  }, [toast, user?.id]);

  useEffect(() => {
    let updatedTickets = tickets;

    if (searchTerm) {
      updatedTickets = updatedTickets.filter(
        (ticket) =>
          ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          ticket.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (typeFilter !== "all") {
      updatedTickets = updatedTickets.filter(
        (ticket) => ticket.type === typeFilter
      );
    }

    if (statusFilter !== "all") {
      updatedTickets = updatedTickets.filter(
        (ticket) => ticket.status === statusFilter
      );
    }

    setFilteredTickets(updatedTickets);
  }, [tickets, searchTerm, typeFilter, statusFilter]);

  const features = [
    {
      icon: <Plus className="h-8 w-8 text-primary" />,
      title: "Criar Novo Chamado",
      description: "Registre uma dúvida ou reporte um problema no sistema",
      action: () => navigate("/criar-chamado"),
      buttonText: "Criar Chamado",
      color: "bg-primary/10 border-primary/20",
    },
    {
      icon: <MessageSquare className="h-8 w-8 text-type-doubt" />,
      title: "Dúvidas",
      description: "Tire suas dúvidas sobre o uso do sistema",
      action: () => navigate("/criar-chamado?tipo=question"),
      buttonText: "Fazer Pergunta",
      color: "bg-type-doubt/10 border-type-doubt/20",
    },
    {
      icon: <Code2 className="h-8 w-8 text-type-development" />,
      title: "Solicitação de Desenvolvimento",
      description:
        "Peça novas funcionalidades ou evoluções para o seu time operar melhor",
      action: () => navigate("/criar-chamado?tipo=development"),
      buttonText: "Pedir melhoria",
      color: "bg-type-development/10 border-type-development/20",
    },
    {
      icon: <Clock className="h-8 w-8 text-type-bug" />,
      title: "Reportar Bug",
      description: "Encontrou um problema? Nos ajude a corrigir",
      action: () => navigate("/criar-chamado?tipo=bug"),
      buttonText: "Reportar Bug",
      color: "bg-type-bug/10 border-type-bug/20",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Portal do Cliente
              </h1>
              <p className="text-muted-foreground">
                Bem-vindo, <span className="font-medium">{user?.name}</span>
              </p>
            </div>
            <Button onClick={handleLogout} variant="outline" className="gap-2">
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
                  <h2 className="text-xl font-semibold mb-2">
                    Sistema de Atendimento Diretrix
                  </h2>
                  <p className="text-muted-foreground mb-4">
                    Aqui você pode registrar suas dúvidas ou reportar problemas
                    encontrados no sistema RP. Nossa equipe de suporte está
                    sempre pronta para ajudá-lo.
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
                <CardTitle className="text-center text-lg">
                  {feature.title}
                </CardTitle>
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

        <div className="mb-8 space-y-4">
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar meus chamados..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={typeFilter}
              onValueChange={(value) =>
                setTypeFilter(value as Ticket["type"] | "all")
              }
            >
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Tipo de solicitação" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                <SelectItem value="question">Dúvida</SelectItem>
                <SelectItem value="bug">Bug</SelectItem>
                <SelectItem value="development">
                  Solicitação de Desenvolvimento
                </SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={statusFilter}
              onValueChange={(value) =>
                setStatusFilter(
                  value as "open" | "in_progress" | "closed" | "all"
                )
              }
            >
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="open">Aberto</SelectItem>
                <SelectItem value="in_progress">Em andamento</SelectItem>
                <SelectItem value="closed">Concluído</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            {isLoadingTickets ? (
              <Card>
                <CardContent className="py-8">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <p>Carregando seus chamados...</p>
                  </div>
                </CardContent>
              </Card>
            ) : filteredTickets.length === 0 ? (
              <Card>
                <CardContent className="py-8">
                  <div className="text-center text-muted-foreground">
                    <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-medium mb-2">
                      Nenhum chamado encontrado
                    </h3>
                    <p>Crie um novo chamado ou ajuste os filtros acima.</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              filteredTickets.map((ticket) => {
                const typeConfig = getTypeConfig(ticket.type);
                const statusConfig = getStatusConfig(ticket.status);
                const TypeIcon = typeConfig.icon;
                const StatusIcon = statusConfig.icon;
                const overdue = isTicketOverdue(ticket);

                return (
                  <Card key={ticket.id}>
                    <CardContent className="pt-6">
                      <div className="flex flex-col gap-4">
                        <div className="flex flex-wrap items-center gap-3">
                          <Badge className={`gap-1 ${typeConfig.color}`}>
                            <TypeIcon className="h-4 w-4" />
                            {typeConfig.label}
                          </Badge>
                          <Badge className={`gap-1 ${statusConfig.color}`}>
                            <StatusIcon className="h-4 w-4" />
                            {statusConfig.label}
                          </Badge>
                          {ticket.attachment && (
                            <Badge
                              variant="secondary"
                              className="gap-1 text-xs"
                            >
                              <Paperclip className="h-3 w-3" />
                              Anexo
                            </Badge>
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg mb-1">
                            {ticket.title}
                          </h3>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {ticket.description}
                          </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                          <span>
                            Aberto em {formatTicketDate(ticket.created_at)}
                          </span>
                          {ticket.due_date && (
                            <>
                              <span>•</span>
                              <span
                                className={
                                  overdue
                                    ? "text-destructive font-semibold"
                                    : "font-medium"
                                }
                              >
                                Prazo: {formatTicketDueDate(ticket.due_date)}
                              </span>
                              {overdue && (
                                <span className="text-destructive text-xs font-semibold uppercase tracking-wide">
                                  Prazo vencido
                                </span>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
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
                <h4 className="font-semibold mb-2 text-type-doubt">
                  Para Dúvidas:
                </h4>
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
