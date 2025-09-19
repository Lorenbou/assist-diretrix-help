-- Create users table
CREATE TABLE public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'client')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create tickets table
CREATE TABLE public.tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('open', 'in_progress', 'closed')),
  priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  type TEXT NOT NULL CHECK (type IN ('question', 'bug')),
  created_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  assigned_to UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create ticket_comments table
CREATE TABLE public.ticket_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create ticket_attachments table
CREATE TABLE public.ticket_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER,
  uploaded_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create ticket_activity table
CREATE TABLE public.ticket_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
  actor_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('created', 'updated', 'status_changed', 'assigned', 'commented', 'attached')),
  meta JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_tickets_status ON public.tickets(status);
CREATE INDEX idx_tickets_created_by ON public.tickets(created_by);
CREATE INDEX idx_tickets_assigned_to ON public.tickets(assigned_to);
CREATE INDEX idx_tickets_created_at ON public.tickets(created_at);
CREATE INDEX idx_ticket_comments_ticket_id ON public.ticket_comments(ticket_id);
CREATE INDEX idx_ticket_attachments_ticket_id ON public.ticket_attachments(ticket_id);
CREATE INDEX idx_ticket_activity_ticket_id ON public.ticket_activity(ticket_id);

-- Enable Row Level Security on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_activity ENABLE ROW LEVEL SECURITY;

-- Create function to update updated_at column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for tickets updated_at
CREATE TRIGGER update_tickets_updated_at
  BEFORE UPDATE ON public.tickets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to get current user role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.users WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;

-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;

-- RLS Policies for users table
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can view all users" ON public.users
  FOR SELECT USING (public.is_admin());

-- RLS Policies for tickets table
CREATE POLICY "Users can view own tickets" ON public.tickets
  FOR SELECT USING (auth.uid() = created_by);

CREATE POLICY "Admins can view all tickets" ON public.tickets
  FOR SELECT USING (public.is_admin());

CREATE POLICY "Users can create tickets" ON public.tickets
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Admins can create any ticket" ON public.tickets
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "Users can update own open tickets" ON public.tickets
  FOR UPDATE USING (
    auth.uid() = created_by AND 
    status = 'open' AND
    public.get_current_user_role() = 'client'
  );

CREATE POLICY "Admins can update all tickets" ON public.tickets
  FOR UPDATE USING (public.is_admin());

CREATE POLICY "Admins can delete tickets" ON public.tickets
  FOR DELETE USING (public.is_admin());

-- RLS Policies for ticket_comments table
CREATE POLICY "Users can view comments on accessible tickets" ON public.ticket_comments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.tickets t
      WHERE t.id = ticket_id AND (
        t.created_by = auth.uid() OR public.is_admin()
      )
    )
  );

CREATE POLICY "Users can create comments on accessible tickets" ON public.ticket_comments
  FOR INSERT WITH CHECK (
    auth.uid() = author_id AND
    EXISTS (
      SELECT 1 FROM public.tickets t
      WHERE t.id = ticket_id AND (
        t.created_by = auth.uid() OR public.is_admin()
      )
    )
  );

-- RLS Policies for ticket_attachments table
CREATE POLICY "Users can view attachments on accessible tickets" ON public.ticket_attachments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.tickets t
      WHERE t.id = ticket_id AND (
        t.created_by = auth.uid() OR public.is_admin()
      )
    )
  );

CREATE POLICY "Users can upload attachments to accessible tickets" ON public.ticket_attachments
  FOR INSERT WITH CHECK (
    auth.uid() = uploaded_by AND
    EXISTS (
      SELECT 1 FROM public.tickets t
      WHERE t.id = ticket_id AND (
        t.created_by = auth.uid() OR public.is_admin()
      )
    )
  );

-- RLS Policies for ticket_activity table
CREATE POLICY "Users can view activity on accessible tickets" ON public.ticket_activity
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.tickets t
      WHERE t.id = ticket_id AND (
        t.created_by = auth.uid() OR public.is_admin()
      )
    )
  );

-- Function to register user after signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'client')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to create user profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to log ticket activity
CREATE OR REPLACE FUNCTION public.log_ticket_activity(
  ticket_id_param UUID,
  action_param TEXT,
  meta_param JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID AS $$
DECLARE
  activity_id UUID;
BEGIN
  INSERT INTO public.ticket_activity (ticket_id, actor_id, action, meta)
  VALUES (ticket_id_param, auth.uid(), action_param, meta_param)
  RETURNING id INTO activity_id;
  
  RETURN activity_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create storage bucket for attachments
INSERT INTO storage.buckets (id, name, public) VALUES ('attachments', 'attachments', false);

-- Storage policies for attachments bucket
CREATE POLICY "Users can view attachments they have access to" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'attachments' AND
    EXISTS (
      SELECT 1 FROM public.ticket_attachments ta
      JOIN public.tickets t ON t.id = ta.ticket_id
      WHERE ta.file_path = name AND (
        t.created_by = auth.uid() OR public.is_admin()
      )
    )
  );

CREATE POLICY "Users can upload attachments" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'attachments' AND
    auth.uid() IS NOT NULL
  );

-- Function to create ticket with activity log
CREATE OR REPLACE FUNCTION public.create_ticket_with_activity(
  title_param TEXT,
  description_param TEXT,
  type_param TEXT,
  priority_param TEXT DEFAULT 'medium'
)
RETURNS UUID AS $$
DECLARE
  ticket_id UUID;
BEGIN
  INSERT INTO public.tickets (title, description, type, priority, status, created_by)
  VALUES (title_param, description_param, type_param, priority_param, 'open', auth.uid())
  RETURNING id INTO ticket_id;
  
  PERFORM public.log_ticket_activity(
    ticket_id, 
    'created', 
    jsonb_build_object(
      'title', title_param,
      'type', type_param,
      'priority', priority_param
    )
  );
  
  RETURN ticket_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;