import { Ticket, CreateTicketData } from '@/types/ticket';

const STORAGE_KEY = 'diretrix-tickets';
const AUTH_KEY = 'diretrix-auth';

// Mock authentication
export const AUTH_CREDENTIALS = {
  admin: { username: 'admin', password: 'admin123', role: 'admin', name: 'Administrador' },
  funcionario: { username: 'funcionario', password: 'func123', role: 'admin', name: 'João Silva - Suporte' },
  cliente1: { username: 'cliente1', password: 'client123', role: 'client', name: 'Maria Santos' },
  cliente2: { username: 'cliente2', password: 'client123', role: 'client', name: 'Carlos Lima' },
};

// Storage utilities
export const storage = {
  getTickets: (): Ticket[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveTickets: (tickets: Ticket[]): void => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets));
  },

  createTicket: (ticketData: CreateTicketData): Ticket => {
    const tickets = storage.getTickets();
    const newTicket: Ticket = {
      ...ticketData,
      id: Date.now().toString(),
      status: 'Aberto',
      createdAt: new Date().toISOString()
    };
    
    tickets.unshift(newTicket);
    storage.saveTickets(tickets);
    return newTicket;
  },

  updateTicketStatus: (id: string, status: Ticket['status']): Ticket | null => {
    const tickets = storage.getTickets();
    const ticketIndex = tickets.findIndex(t => t.id === id);
    
    if (ticketIndex === -1) return null;
    
    tickets[ticketIndex] = { ...tickets[ticketIndex], status };
    storage.saveTickets(tickets);
    return tickets[ticketIndex];
  },

  getTicketById: (id: string): Ticket | null => {
    const tickets = storage.getTickets();
    return tickets.find(t => t.id === id) || null;
  },

  // Auth utilities
  isAuthenticated: (): boolean => {
    return localStorage.getItem(AUTH_KEY) !== null;
  },

  getCurrentUser: (): { username: string; role: 'admin' | 'client'; name: string } | null => {
    const userData = localStorage.getItem(AUTH_KEY);
    return userData ? JSON.parse(userData) : null;
  },

  login: (username: string, password: string): { success: boolean; user?: any } => {
    const user = Object.values(AUTH_CREDENTIALS).find(
      cred => cred.username === username && cred.password === password
    );
    
    if (user) {
      localStorage.setItem(AUTH_KEY, JSON.stringify({
        username: user.username,
        role: user.role,
        name: user.name
      }));
      return { success: true, user };
    }
    return { success: false };
  },

  logout: (): void => {
    localStorage.removeItem(AUTH_KEY);
  }
};

// Initialize with sample data if empty
if (storage.getTickets().length === 0) {
  const sampleTickets: Ticket[] = [
    {
      id: '1',
      username: 'João Silva',
      type: 'Bug',
      title: 'Erro ao gerar relatório mensal',
      description: 'O sistema apresenta erro 500 quando tento gerar o relatório de vendas do mês atual.',
      status: 'Em andamento',
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
    },
    {
      id: '2',
      username: 'Maria Santos',
      type: 'Dúvida',
      title: 'Como configurar permissões de usuário',
      description: 'Preciso entender como configurar as permissões para novos usuários no sistema.',
      status: 'Aberto',
      createdAt: new Date(Date.now() - 86400000).toISOString()
    },
    {
      id: '3',
      username: 'Carlos Lima',
      type: 'Bug',
      title: 'Sistema não salva dados do cliente',
      description: 'Após preencher o cadastro do cliente, o sistema não salva as informações.',
      status: 'Concluído',
      createdAt: new Date(Date.now() - 86400000 * 5).toISOString()
    }
  ];
  
  storage.saveTickets(sampleTickets);
}