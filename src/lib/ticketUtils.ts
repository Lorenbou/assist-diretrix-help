import { AlertCircle, Clock, CheckCircle, Bug, HelpCircle } from 'lucide-react';
import { Ticket } from '@/types/ticket';

type TicketStatus = Ticket['status'];
type TicketType = Ticket['type'];

export const getStatusConfig = (status: TicketStatus) => {
  const configs = {
    open: {
      icon: AlertCircle,
      label: 'Aberto',
      color: 'bg-status-open text-white',
    },
    in_progress: {
      icon: Clock,
      label: 'Em andamento',
      color: 'bg-status-progress text-white',
    },
    closed: {
      icon: CheckCircle,
      label: 'Concluído',
      color: 'bg-status-completed text-white',
    },
  };
  return configs[status];
};

export const getTypeConfig = (type: TicketType) => {
  const configs = {
    bug: {
      icon: Bug,
      label: 'Bug',
      color: 'bg-type-bug text-white',
    },
    question: {
      icon: HelpCircle,
      label: 'Dúvida',
      color: 'bg-type-doubt text-white',
    },
  };
  return configs[type];
};

export const formatTicketDate = (dateString: string, includeWeekday = false) => {
  const options: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  };

  if (includeWeekday) {
    options.weekday = 'long';
    options.month = 'long';
  }

  return new Date(dateString).toLocaleDateString('pt-BR', options);
};

