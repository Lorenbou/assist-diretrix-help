import { useState, useEffect, ChangeEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Send,
  Bug,
  HelpCircle,
  Code2,
  Paperclip,
  CalendarDays,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { ticketService } from "@/lib/tickets";
import { CreateTicketData } from "@/types/ticket";

type TicketFormType = CreateTicketData["type"];

const CreateTicket = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<TicketFormType>("question");
  const [priority, setPriority] = useState<
    "low" | "medium" | "high" | "urgent"
  >("medium");
  const [dueDate, setDueDate] = useState("");
  const [attachment, setAttachment] = useState<string | null>(null);
  const [attachmentName, setAttachmentName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const descriptionPlaceholders: Record<TicketFormType, string> = {
    bug: "Descreva o problema encontrado, os passos para reproduzi-lo e o comportamento esperado...",
    question:
      "Explique sua dúvida em detalhes, em qual parte do sistema está e o que está tentando fazer...",
    development:
      "Detalhe a necessidade de desenvolvimento, objetivo do negócio, usuários impactados e prazo desejado...",
  };

  const tipsContent: Record<TicketFormType, string[]> = {
    bug: [
      "• Descreva exatamente o que aconteceu",
      "• Informe os passos que levaram ao problema",
      "• Mencione mensagens de erro, se houver",
      "• Inclua o navegador e sistema operacional",
    ],
    question: [
      "• Seja específico sobre sua dúvida",
      "• Informe em qual tela ou função está",
      "• Descreva o que está tentando fazer",
      "• Mencione se já tentou alguma solução",
    ],
    development: [
      "• Descreva o objetivo e o problema atual",
      "• Informe quem será impactado pela mudança",
      "• Compartilhe referências ou telas de apoio",
      "• Indique o prazo esperado e dependências",
    ],
  };

  const tipsTitle: Record<TicketFormType, string> = {
    bug: "Dicas para reportar bugs:",
    question: "Dicas para fazer perguntas:",
    development: "Dicas para solicitar desenvolvimento:",
  };

  useEffect(() => {
    const urlType = searchParams.get("tipo");
    if (urlType === "bug") {
      setType("bug");
    } else if (urlType === "question") {
      setType("question");
    } else if (urlType === "development") {
      setType("development");
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
        due_date: dueDate || null,
        attachment,
      };

      await ticketService.createTicket(ticketData);

      toast({
        title: "Chamado criado com sucesso!",
        description:
          "Sua solicitação foi registrada e será analisada pela equipe.",
      });

      if (user?.role === "admin") {
        navigate("/dashboard");
      } else {
        navigate("/cliente-dashboard");
      }

      setDueDate("");
      setAttachment(null);
      setAttachmentName("");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao criar chamado",
        description:
          error instanceof Error ? error.message : "Tente novamente.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (user?.role === "admin") {
      navigate("/dashboard");
    } else {
      navigate("/cliente-dashboard");
    }
  };

  const handleAttachmentChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      setAttachment(null);
      setAttachmentName("");
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast({
        variant: "destructive",
        title: "Formato inválido",
        description: "Selecione um arquivo de imagem para anexar.",
      });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setAttachment(reader.result as string);
      setAttachmentName(file.name);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAttachment = () => {
    setAttachment(null);
    setAttachmentName("");
  };

  const headerIcons: Record<TicketFormType, JSX.Element> = {
    bug: <Bug className="h-5 w-5 text-type-bug" />,
    question: <HelpCircle className="h-5 w-5 text-type-doubt" />,
    development: <Code2 className="h-5 w-5 text-type-development" />,
  };

  const headerIcon = headerIcons[type];

  return (
    <div className="min-h-screen bg-background">
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
              <h1 className="text-2xl font-bold text-foreground">
                Criar Novo Chamado
              </h1>
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
                {headerIcon}
                Detalhes do Chamado
              </CardTitle>
              <CardDescription>
                Preencha as informações abaixo para que possamos ajudá-lo da
                melhor forma possível
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">Tipo de solicitação</Label>
                    <Select
                      value={type}
                      onValueChange={(value: TicketFormType) => setType(value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um tipo" />
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
                            Bug
                          </div>
                        </SelectItem>
                        <SelectItem value="development">
                          <div className="flex items-center gap-2">
                            <Code2 className="h-4 w-4 text-type-development" />
                            Solicitação de desenvolvimento
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="priority">Prioridade</Label>
                    <Select
                      value={priority}
                      onValueChange={(
                        value: "low" | "medium" | "high" | "urgent"
                      ) => setPriority(value)}
                    >
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dueDate">Prazo desejado</Label>
                    <div className="relative">
                      <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                      <Input
                        id="dueDate"
                        type="date"
                        className="pl-10"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Opcional – informe quando precisa da entrega.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="attachment">Anexar imagem (opcional)</Label>
                    <Input
                      id="attachment"
                      type="file"
                      accept="image/*"
                      onChange={handleAttachmentChange}
                    />
                    {attachmentName && (
                      <div className="flex items-center justify-between rounded-md border border-dashed border-border px-3 py-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Paperclip className="h-4 w-4" />
                          <span className="truncate max-w-[140px] md:max-w-[200px]">
                            {attachmentName}
                          </span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-destructive"
                          onClick={handleRemoveAttachment}
                        >
                          Remover
                        </Button>
                      </div>
                    )}
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
                    placeholder={descriptionPlaceholders[type]}
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
                    {tipsTitle[type]}
                  </h4>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    {tipsContent[type].map((tip) => (
                      <li key={tip}>{tip}</li>
                    ))}
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
