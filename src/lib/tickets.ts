import { supabase } from "@/integrations/supabase/client";
import { CreateTicketData, Ticket } from "@/types/ticket";

type TicketFilters = {
  status?: string;
  type?: string;
  search?: string;
  createdBy?: string;
  assignedTo?: string;
};

export const ticketService = {
  /**
   * Lista tickets aplicando filtros opcionais.
   */
  async getTickets(filters?: TicketFilters): Promise<Ticket[]> {
    let query = supabase
      .from("tickets")
      .select(
        `
        *,
        created_by_user:users!created_by(name, email, role),
        assigned_to_user:users!assigned_to(name, email, role)
      `
      )
      .order("created_at", { ascending: false });

    if (filters?.status && filters.status !== "all") {
      query = query.eq("status", filters.status);
    }

    if (filters?.type && filters.type !== "all") {
      query = query.eq("type", filters.type);
    }

    if (filters?.createdBy) {
      query = query.eq("created_by", filters.createdBy);
    }

    if (filters?.assignedTo) {
      query = query.eq("assigned_to", filters.assignedTo);
    }

    if (filters?.search) {
      query = query.or(
        `title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
      );
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(error.message);
    }

    return data as Ticket[];
  },

  /**
   * Busca um ticket específico, retornando nulo se não existir.
   */
  async getTicketById(id: string): Promise<Ticket | null> {
    const { data, error } = await supabase
      .from("tickets")
      .select(
        `
        *,
        created_by_user:users!created_by(name, email, role),
        assigned_to_user:users!assigned_to(name, email, role)
      `
      )
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null; // Not found
      }
      throw new Error(error.message);
    }

    return data as Ticket;
  },

  /**
   * Cria o ticket via RPC no banco para garantir o log de atividades.
   */
  async createTicket(ticketData: CreateTicketData): Promise<Ticket> {
    const { data, error } = await supabase.rpc("create_ticket_with_activity", {
      title_param: ticketData.title,
      description_param: ticketData.description,
      type_param: ticketData.type,
      priority_param: ticketData.priority || "medium",
      due_date_param: ticketData.due_date,
      attachment_param: ticketData.attachment,
    });

    if (error) {
      throw new Error(error.message);
    }

    const ticket = await this.getTicketById(data);
    if (!ticket) {
      throw new Error("Failed to fetch created ticket");
    }

    return ticket;
  },

  /**
   * Atualiza campos básicos do ticket e registra atividades importantes.
   */
  async updateTicket(id: string, updates: Partial<Ticket>): Promise<Ticket> {
    const { error } = await supabase
      .from("tickets")
      .update(updates)
      .eq("id", id);

    if (error) {
      throw new Error(error.message);
    }

    if (updates.status) {
      await supabase.rpc("log_ticket_activity", {
        ticket_id_param: id,
        action_param: "status_changed",
        meta_param: { new_status: updates.status },
      });
    }

    if (updates.assigned_to) {
      await supabase.rpc("log_ticket_activity", {
        ticket_id_param: id,
        action_param: "assigned",
        meta_param: { assigned_to: updates.assigned_to },
      });
    }

    const ticket = await this.getTicketById(id);
    if (!ticket) {
      throw new Error("Failed to fetch updated ticket");
    }

    return ticket;
  },
};
