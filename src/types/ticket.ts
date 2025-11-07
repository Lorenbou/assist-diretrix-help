export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: "open" | "in_progress" | "closed";
  priority: "low" | "medium" | "high" | "urgent";
  type: "question" | "bug";
  created_by: string;
  assigned_to?: string;
  created_at: string;
  updated_at: string;
  created_by_user?: {
    name: string;
    email: string;
    role: string;
  };
  assigned_to_user?: {
    name: string;
    email: string;
    role: string;
  };
}

export interface CreateTicketData {
  title: string;
  description: string;
  type: "question" | "bug";
  priority?: "low" | "medium" | "high" | "urgent";
}

export interface TicketComment {
  id: string;
  ticket_id: string;
  author_id: string;
  content: string;
  created_at: string;
  author?: {
    name: string;
    email: string;
  };
}

export interface TicketAttachment {
  id: string;
  ticket_id: string;
  file_path: string;
  file_name: string;
  file_size?: number;
  uploaded_by: string;
  created_at: string;
  uploaded_by_user?: {
    name: string;
    email: string;
  };
}

export interface TicketActivity {
  id: string;
  ticket_id: string;
  actor_id: string;
  action:
    | "created"
    | "updated"
    | "status_changed"
    | "assigned"
    | "commented"
    | "attached";
  meta: Record<string, unknown>;
  created_at: string;
  actor?: {
    name: string;
    email: string;
  };
}
