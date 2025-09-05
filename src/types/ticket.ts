export type TicketType = 'Dúvida' | 'Bug';
export type TicketStatus = 'Aberto' | 'Em andamento' | 'Concluído';

export interface Ticket {
  id: string;
  username: string;
  type: TicketType;
  title: string;
  description: string;
  status: TicketStatus;
  createdAt: string;
}

export interface CreateTicketData {
  username: string;
  type: TicketType;
  title: string;
  description: string;
}