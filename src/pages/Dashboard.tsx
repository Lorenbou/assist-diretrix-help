import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { ticketService } from "@/lib/tickets";
import {
  formatTicketDate,
  formatTicketDueDate,
  getStatusConfig,
  getTypeConfig,
  isTicketOverdue,
} from "@/lib/ticketUtils";
import { Ticket } from "@/types/ticket";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  LogOut,
  Paperclip,
  Plus,
  Search,
} from "lucide-react";

const Dashboard = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<Ticket[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<Ticket["type"] | "all">("all");
  const [statusFilter, setStatusFilter] = useState<
    "open" | "in_progress" | "closed" | "all"
  >("all");
  const navigate = useNavigate();
  const { signOut } = useAuth();

  useEffect(() => {
    loadTickets();
  }, []);

  useEffect(() => {
    let filtered = tickets;

    if (searchTerm) {
      filtered = filtered.filter(
        (ticket) =>
          ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          ticket.created_by_user?.name
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          ticket.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (typeFilter !== "all") {
      filtered = filtered.filter((ticket) => ticket.type === typeFilter);
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((ticket) => ticket.status === statusFilter);
    }

    setFilteredTickets(filtered);
  }, [tickets, searchTerm, typeFilter, statusFilter]);

  const loadTickets = async () => {
    try {
      const allTickets = await ticketService.getTickets();
      setTickets(allTickets);
    } catch (error) {
      console.error("Erro ao carregar tickets:", error);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Dashboard Diretrix
              </h1>
              <p className="text-muted-foreground">
                Sistema de Gerenciamento de Chamados
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
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar chamados..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select
            value={typeFilter}
            onValueChange={(value) =>
              setTypeFilter(value as Ticket["type"] | "all")
            }
          >
            <SelectTrigger className="w-full md:w-40">
              <SelectValue placeholder="Tipo de solicitação" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os tipos</SelectItem>
              <SelectItem value="question">Dúvida</SelectItem>
              <SelectItem value="bug">Bug</SelectItem>
              <SelectItem value="development">
                Solicitação de desenvolvimento
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
            <SelectTrigger className="w-full md:w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              <SelectItem value="open">Aberto</SelectItem>
              <SelectItem value="in_progress">Em andamento</SelectItem>
              <SelectItem value="closed">Concluído</SelectItem>
            </SelectContent>
          </Select>
          <Button
            onClick={() => navigate("/criar-chamado")}
            className="gap-2 bg-primary hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Novo Chamado
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Total
                  </p>
                  <p className="text-2xl font-bold">{tickets.length}</p>
                </div>
                <div className="h-8 w-8 bg-muted rounded-lg flex items-center justify-center">
                  <AlertCircle className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Abertos
                  </p>
                  <p className="text-2xl font-bold text-status-open">
                    {tickets.filter((t) => t.status === "open").length}
                  </p>
                </div>
                <div className="h-8 w-8 bg-status-open/10 rounded-lg flex items-center justify-center">
                  <AlertCircle className="h-4 w-4 text-status-open" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Em andamento
                  </p>
                  <p className="text-2xl font-bold text-status-progress">
                    {tickets.filter((t) => t.status === "in_progress").length}
                  </p>
                </div>
                <div className="h-8 w-8 bg-status-progress/10 rounded-lg flex items-center justify-center">
                  <Clock className="h-4 w-4 text-status-progress" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Concluídos
                  </p>
                  <p className="text-2xl font-bold text-status-completed">
                    {tickets.filter((t) => t.status === "closed").length}
                  </p>
                </div>
                <div className="h-8 w-8 bg-status-completed/10 rounded-lg flex items-center justify-center">
                  <CheckCircle className="h-4 w-4 text-status-completed" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          {filteredTickets.length === 0 ? (
            <Card>
              <CardContent className="py-8">
                <div className="text-center text-muted-foreground">
                  <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">
                    Nenhum chamado encontrado
                  </h3>
                  <p>Tente ajustar os filtros ou criar um novo chamado</p>
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
                <Card
                  key={ticket.id}
                  className="cursor-pointer hover:shadow-md transition-all duration-200 hover:border-primary/20"
                  onClick={() => navigate(`/chamado/${ticket.id}`)}
                >
                  <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
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
                        <h3 className="font-semibold text-lg mb-2">
                          {ticket.title}
                        </h3>
                        <p className="text-muted-foreground mb-2 line-clamp-2">
                          {ticket.description}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>
                            Por:{" "}
                            <span className="font-medium">
                              {ticket.created_by_user?.name || "Usuário"}
                            </span>
                          </span>
                          <span aria-hidden="true">•</span>
                          <span>{formatTicketDate(ticket.created_at)}</span>
                        </div>
                        {ticket.due_date && (
                          <div className="mt-2 flex items-center gap-2 text-sm">
                            <span
                              className={
                                overdue
                                  ? "text-destructive font-semibold"
                                  : "text-muted-foreground font-medium"
                              }
                            >
                              Prazo: {formatTicketDueDate(ticket.due_date)}
                            </span>
                            {overdue && (
                              <span className="text-destructive text-xs font-semibold uppercase tracking-wide">
                                Prazo vencido
                              </span>
                            )}
                          </div>
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
    </div>
  );
};

export default Dashboard;
