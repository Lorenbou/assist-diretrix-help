export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: "open" | "in_progress" | "closed";
  priority: "low" | "medium" | "high" | "urgent";
  type: "question" | "bug" | "development";
  due_date?: string | null;
  attachment?: string | null;
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
  type: "question" | "bug" | "development";
  priority?: "low" | "medium" | "high" | "urgent";
  due_date?: string | null;
  attachment?: string | null;
}
