import {
  AlertCircle,
  Clock,
  CheckCircle,
  Bug,
  HelpCircle,
  Code2,
} from "lucide-react";
import { Ticket } from "@/types/ticket";

type TicketStatus = Ticket["status"];
type TicketType = Ticket["type"];

export const getStatusConfig = (status: TicketStatus) => {
  const configs = {
    open: {
      icon: AlertCircle,
      label: "Aberto",
      color: "bg-status-open text-white",
    },
    in_progress: {
      icon: Clock,
      label: "Em andamento",
      color: "bg-status-progress text-white",
    },
    closed: {
      icon: CheckCircle,
      label: "Concluído",
      color: "bg-status-completed text-white",
    },
  };
  return configs[status];
};

export const getTypeConfig = (type: TicketType) => {
  const configs = {
    bug: {
      icon: Bug,
      label: "Bug",
      color: "bg-type-bug text-white",
    },
    question: {
      icon: HelpCircle,
      label: "Dúvida",
      color: "bg-type-doubt text-white",
    },
    development: {
      icon: Code2,
      label: "Solicitação de Desenvolvimento",
      color: "bg-type-development text-white",
    },
  };
  return configs[type] ?? configs.question;
};

export const formatTicketDate = (
  dateString: string,
  includeWeekday = false
) => {
  const options: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };

  if (includeWeekday) {
    options.weekday = "long";
    options.month = "long";
  }

  return new Date(dateString).toLocaleDateString("pt-BR", options);
};

export const formatTicketDueDate = (dateString: string) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

export const isTicketOverdue = (ticket: Ticket) => {
  if (!ticket.due_date || ticket.status === "closed") {
    return false;
  }

  const dueDate = new Date(ticket.due_date);
  const now = new Date();

  dueDate.setHours(23, 59, 59, 999);

  return dueDate.getTime() < now.getTime();
};
