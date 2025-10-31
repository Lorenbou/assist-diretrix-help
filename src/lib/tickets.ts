import { supabase } from '@/integrations/supabase/client';
import { Ticket, CreateTicketData, TicketComment, TicketAttachment } from '@/types/ticket';

export const ticketService = {
  async getTickets(filters?: {
    status?: string;
    type?: string;
    search?: string;
  }): Promise<Ticket[]> {
    let query = supabase
      .from('tickets')
      .select(`
        *,
        created_by_user:users!created_by(name, email, role),
        assigned_to_user:users!assigned_to(name, email, role)
      `)
      .order('created_at', { ascending: false });

    if (filters?.status && filters.status !== 'all') {
      query = query.eq('status', filters.status);
    }

    if (filters?.type && filters.type !== 'all') {
      query = query.eq('type', filters.type);
    }

    if (filters?.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(error.message);
    }

    return data as Ticket[];
  },

  async getTicketById(id: string): Promise<Ticket | null> {
    const { data, error } = await supabase
      .from('tickets')
      .select(`
        *,
        created_by_user:users!created_by(name, email, role),
        assigned_to_user:users!assigned_to(name, email, role)
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      throw new Error(error.message);
    }

    return data as Ticket;
  },

  async createTicket(ticketData: CreateTicketData): Promise<Ticket> {
    const { data, error } = await supabase.rpc('create_ticket_with_activity', {
      title_param: ticketData.title,
      description_param: ticketData.description,
      type_param: ticketData.type,
      priority_param: ticketData.priority || 'medium'
    });

    if (error) {
      throw new Error(error.message);
    }

    const ticket = await this.getTicketById(data);
    if (!ticket) {
      throw new Error('Failed to fetch created ticket');
    }

    return ticket;
  },

  async updateTicket(id: string, updates: Partial<Ticket>): Promise<Ticket> {
    const { error } = await supabase
      .from('tickets')
      .update(updates)
      .eq('id', id);

    if (error) {
      throw new Error(error.message);
    }

    if (updates.status) {
      await supabase.rpc('log_ticket_activity', {
        ticket_id_param: id,
        action_param: 'status_changed',
        meta_param: { new_status: updates.status }
      });
    }

    if (updates.assigned_to) {
      await supabase.rpc('log_ticket_activity', {
        ticket_id_param: id,
        action_param: 'assigned',
        meta_param: { assigned_to: updates.assigned_to }
      });
    }

    const ticket = await this.getTicketById(id);
    if (!ticket) {
      throw new Error('Failed to fetch updated ticket');
    }

    return ticket;
  },

  // Get ticket comments
  async getTicketComments(ticketId: string): Promise<TicketComment[]> {
    const { data, error } = await supabase
      .from('ticket_comments')
      .select(`
        *,
        author:users!author_id(name, email)
      `)
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: true });

    if (error) {
      throw new Error(error.message);
    }

    return data || [];
  },

  async addComment(ticketId: string, content: string): Promise<TicketComment> {
    const { data, error } = await supabase
      .from('ticket_comments')
      .insert({
        ticket_id: ticketId,
        author_id: (await supabase.auth.getUser()).data.user?.id,
        content
      })
      .select(`
        *,
        author:users!author_id(name, email)
      `)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    await supabase.rpc('log_ticket_activity', {
      ticket_id_param: ticketId,
      action_param: 'commented',
      meta_param: { comment_preview: content.substring(0, 100) }
    });

    return data;
  },

  async getTicketAttachments(ticketId: string): Promise<TicketAttachment[]> {
    const { data, error } = await supabase
      .from('ticket_attachments')
      .select(`
        *,
        uploaded_by_user:users!uploaded_by(name, email)
      `)
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return data || [];
  },

  async uploadAttachment(ticketId: string, file: File): Promise<TicketAttachment> {
    const fileName = `${Date.now()}-${file.name}`;
    const filePath = `${ticketId}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('attachments')
      .upload(filePath, file);

    if (uploadError) {
      throw new Error(uploadError.message);
    }

    const { data, error } = await supabase
      .from('ticket_attachments')
      .insert({
        ticket_id: ticketId,
        file_path: filePath,
        file_name: file.name,
        file_size: file.size,
        uploaded_by: (await supabase.auth.getUser()).data.user?.id
      })
      .select(`
        *,
        uploaded_by_user:users!uploaded_by(name, email)
      `)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    await supabase.rpc('log_ticket_activity', {
      ticket_id_param: ticketId,
      action_param: 'attached',
      meta_param: { file_name: file.name, file_size: file.size }
    });

    return data;
  },

  async downloadAttachment(filePath: string): Promise<Blob> {
    const { data, error } = await supabase.storage
      .from('attachments')
      .download(filePath);

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  async getUsers(): Promise<Array<{ id: string; name: string; email: string; role: string }>> {
    const { data, error } = await supabase
      .from('users')
      .select('id, name, email, role')
      .order('name');

    if (error) {
      throw new Error(error.message);
    }

    return data || [];
  }
};