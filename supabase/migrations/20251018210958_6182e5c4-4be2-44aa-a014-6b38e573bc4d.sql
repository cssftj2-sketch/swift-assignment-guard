-- Create journalists table
CREATE TABLE public.journalists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  national_id TEXT NOT NULL UNIQUE,
  phone TEXT NOT NULL,
  email TEXT,
  photo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create assignments table
CREATE TABLE public.assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  journalist_id UUID NOT NULL REFERENCES public.journalists(id) ON DELETE CASCADE,
  assignment_number TEXT NOT NULL UNIQUE,
  mission_type TEXT NOT NULL,
  mission_location TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  issued_by TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'upcoming')),
  qr_code_data TEXT NOT NULL UNIQUE,
  signature_hash TEXT NOT NULL,
  encryption_key TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create verification_logs table
CREATE TABLE public.verification_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
  verified_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  verification_count INTEGER DEFAULT 1,
  verified_by TEXT,
  verification_result TEXT NOT NULL,
  notes TEXT
);

-- Enable Row Level Security
ALTER TABLE public.journalists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for journalists (public read for verification)
CREATE POLICY "Anyone can view journalists"
  ON public.journalists FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert journalists"
  ON public.journalists FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update journalists"
  ON public.journalists FOR UPDATE
  USING (true);

-- Create policies for assignments (public for verification)
CREATE POLICY "Anyone can view assignments"
  ON public.assignments FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert assignments"
  ON public.assignments FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update assignments"
  ON public.assignments FOR UPDATE
  USING (true);

-- Create policies for verification_logs (public for logging)
CREATE POLICY "Anyone can view verification logs"
  ON public.verification_logs FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert verification logs"
  ON public.verification_logs FOR INSERT
  WITH CHECK (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_journalists_updated_at
  BEFORE UPDATE ON public.journalists
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_assignments_updated_at
  BEFORE UPDATE ON public.assignments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better performance
CREATE INDEX idx_assignments_journalist_id ON public.assignments(journalist_id);
CREATE INDEX idx_assignments_status ON public.assignments(status);
CREATE INDEX idx_verification_logs_assignment_id ON public.verification_logs(assignment_id);